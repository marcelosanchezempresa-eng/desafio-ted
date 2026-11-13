-- =====================================================================
--  Semáforo Jóvenes 26 · CITEF — base de datos en Supabase
--  Pegar completo en Supabase → SQL Editor → New query → Run.
--  Se puede volver a ejecutar sin perder datos.
-- =====================================================================

-- ---------- Tablas ----------

-- Quién puede usar la aplicación. Solo estos correos ven y califican.
create table if not exists public.docentes (
  email      text primary key check (email = lower(email)),
  nombre     text not null default '',
  rol        text not null default 'docente' check (rol in ('docente','coordinacion')),
  activo     boolean not null default true,
  creado_en  timestamptz not null default now()
);

-- Configuración del curso (una sola fila): estudiantes, componentes, fechas, pesos.
create table if not exists public.config (
  id          int primary key default 1 check (id = 1),
  data        jsonb not null default '{}'::jsonb,
  editado_en  timestamptz not null default now(),
  editado_por text
);

-- Una fila por clase (fecha + componente) con la evaluación de cada estudiante en «ev».
create table if not exists public.clases (
  id          text primary key,             -- "2026-11-16_lectoescritura"
  fecha       date not null,
  comp        text not null,
  ev          jsonb not null default '{}'::jsonb,
  autor       text,
  creado_en   timestamptz not null default now(),
  editado_en  timestamptz not null default now(),
  editado_por text
);
create index if not exists clases_fecha_idx on public.clases (fecha desc);

-- Una fila por hito (entrega con fecha) con la evaluación de cada estudiante en «ev».
create table if not exists public.hitos (
  id          text primary key,
  comp        text not null,
  nombre      text not null,
  tipo        text not null default 'trabajo',
  fecha       date not null,
  ev          jsonb not null default '{}'::jsonb,
  autor       text,
  creado_en   timestamptz not null default now(),
  editado_en  timestamptz not null default now(),
  editado_por text
);
create index if not exists hitos_fecha_idx on public.hitos (fecha desc);

-- ---------- Quién es quién ----------

create or replace function public.mi_correo() returns text
language sql stable as $$ select lower(coalesce(auth.jwt() ->> 'email', '')) $$;

create or replace function public.es_docente() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.docentes d where d.email = public.mi_correo() and d.activo)
$$;

create or replace function public.es_coordinacion() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.docentes d where d.email = public.mi_correo() and d.activo and d.rol = 'coordinacion')
$$;

-- Lo que la app consulta al entrar: si el correo está autorizado y con qué rol.
create or replace function public.mi_perfil() returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'email', public.mi_correo(),
    'autorizado', coalesce(d.activo, false),
    'rol', d.rol,
    'nombre', d.nombre)
  from (select 1) x left join public.docentes d on d.email = public.mi_correo()
$$;

-- ---------- Seguridad por filas (RLS) ----------

alter table public.docentes enable row level security;
alter table public.config   enable row level security;
alter table public.clases   enable row level security;
alter table public.hitos    enable row level security;

drop policy if exists docentes_leer  on public.docentes;
drop policy if exists docentes_coord on public.docentes;
create policy docentes_leer  on public.docentes for select to authenticated using (public.es_docente());
create policy docentes_coord on public.docentes for all    to authenticated using (public.es_coordinacion()) with check (public.es_coordinacion());

drop policy if exists config_leer  on public.config;
drop policy if exists config_coord on public.config;
create policy config_leer  on public.config for select to authenticated using (public.es_docente());
create policy config_coord on public.config for all    to authenticated using (public.es_coordinacion()) with check (public.es_coordinacion());

drop policy if exists clases_leer     on public.clases;
drop policy if exists clases_crear    on public.clases;
drop policy if exists clases_editar   on public.clases;
drop policy if exists clases_borrar   on public.clases;
create policy clases_leer   on public.clases for select to authenticated using (public.es_docente());
create policy clases_crear  on public.clases for insert to authenticated with check (public.es_docente());
create policy clases_editar on public.clases for update to authenticated using (public.es_docente()) with check (public.es_docente());
create policy clases_borrar on public.clases for delete to authenticated using (public.es_coordinacion());

drop policy if exists hitos_leer   on public.hitos;
drop policy if exists hitos_crear  on public.hitos;
drop policy if exists hitos_editar on public.hitos;
drop policy if exists hitos_borrar on public.hitos;
create policy hitos_leer   on public.hitos for select to authenticated using (public.es_docente());
create policy hitos_crear  on public.hitos for insert to authenticated with check (public.es_docente());
create policy hitos_editar on public.hitos for update to authenticated using (public.es_docente()) with check (public.es_docente());
create policy hitos_borrar on public.hitos for delete to authenticated using (public.es_docente());

-- ---------- Guardar una evaluación sin pisar la de otro docente ----------
-- Cada toque manda solo lo que cambió de UN estudiante; la base lo mezcla con lo que ya hay.
-- Corre con los permisos de quien llama (security invoker), así que respeta las reglas de arriba.

create or replace function public.evaluar_clase(p_id text, p_fecha date, p_comp text, p_cambios jsonb)
returns void language plpgsql security invoker set search_path = public as $$
declare sid text; cambio jsonb;
begin
  if not public.es_docente() then raise exception 'sin_permiso' using errcode = '42501'; end if;
  insert into public.clases (id, fecha, comp, ev, autor, editado_por)
  values (p_id, p_fecha, p_comp, '{}'::jsonb, public.mi_correo(), public.mi_correo())
  on conflict (id) do nothing;
  for sid, cambio in select * from jsonb_each(p_cambios) loop
    update public.clases
       set ev = jsonb_set(ev, array[sid], coalesce(ev -> sid, '{}'::jsonb) || cambio, true),
           editado_en = now(), editado_por = public.mi_correo()
     where id = p_id;
  end loop;
end $$;

create or replace function public.evaluar_hito(p_id text, p_cambios jsonb)
returns void language plpgsql security invoker set search_path = public as $$
declare sid text; cambio jsonb;
begin
  if not public.es_docente() then raise exception 'sin_permiso' using errcode = '42501'; end if;
  if not exists (select 1 from public.hitos where id = p_id) then raise exception 'hito_inexistente' using errcode = 'P0002'; end if;
  for sid, cambio in select * from jsonb_each(p_cambios) loop
    update public.hitos
       set ev = jsonb_set(ev, array[sid], coalesce(ev -> sid, '{}'::jsonb) || cambio, true),
           editado_en = now(), editado_por = public.mi_correo()
     where id = p_id;
  end loop;
end $$;

revoke all on function public.evaluar_clase(text, date, text, jsonb) from public, anon;
revoke all on function public.evaluar_hito(text, jsonb)             from public, anon;
grant execute on function public.evaluar_clase(text, date, text, jsonb) to authenticated;
grant execute on function public.evaluar_hito(text, jsonb)             to authenticated;
grant execute on function public.mi_perfil() to authenticated;

-- ---------- Avisos en vivo (lo que marca un docente aparece en las pantallas de los demás) ----------
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin alter publication supabase_realtime add table public.clases; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.hitos;  exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.config; exception when duplicate_object then null; end;
  end if;
end $$;

-- ---------- Fila de configuración vacía (la completa la coordinación) ----------
insert into public.config (id, data) values (1, '{}'::jsonb) on conflict (id) do nothing;
