-- =====================================================================
--  Semáforo Jóvenes 26 · Actualización 3
--  1) Cada docente solo carga y modifica en SUS componentes.
--  2) Instancias de evaluación con juicios formativos (por estudiante y del grupo).
--  Pegar en Supabase → SQL Editor → New query → Run. Se puede volver a ejecutar.
-- =====================================================================

-- ---------- 1. Componentes asignados a cada docente ----------
alter table public.docentes add column if not exists componentes text[] not null default '{}';

create or replace function public.mis_componentes() returns text[]
language sql stable security definer set search_path = public as $$
  select coalesce((select d.componentes from public.docentes d where d.email = public.mi_correo() and d.activo), '{}'::text[])
$$;

-- La coordinación puede corregir cualquier componente; cada docente, solo los suyos.
create or replace function public.puede_comp(p_comp text) returns boolean
language sql stable security definer set search_path = public as $$
  select public.es_coordinacion() or (public.es_docente() and p_comp = any(public.mis_componentes()))
$$;

create or replace function public.mi_perfil() returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'email', public.mi_correo(),
    'autorizado', coalesce(d.activo, false),
    'rol', d.rol,
    'nombre', d.nombre,
    'componentes', coalesce(d.componentes, '{}'::text[]))
  from (select 1) x left join public.docentes d on d.email = public.mi_correo()
$$;

drop policy if exists clases_crear  on public.clases;
drop policy if exists clases_editar on public.clases;
create policy clases_crear  on public.clases for insert to authenticated with check (public.puede_comp(comp));
create policy clases_editar on public.clases for update to authenticated using (public.puede_comp(comp)) with check (public.puede_comp(comp));

drop policy if exists hitos_crear  on public.hitos;
drop policy if exists hitos_editar on public.hitos;
drop policy if exists hitos_borrar on public.hitos;
create policy hitos_crear  on public.hitos for insert to authenticated with check (public.puede_comp(comp));
create policy hitos_editar on public.hitos for update to authenticated using (public.puede_comp(comp)) with check (public.puede_comp(comp));
create policy hitos_borrar on public.hitos for delete to authenticated using (public.puede_comp(comp));

create or replace function public.evaluar_clase(p_id text, p_fecha date, p_comp text, p_cambios jsonb)
returns void language plpgsql security invoker set search_path = public as $$
declare sid text; cambio jsonb;
begin
  if not public.puede_comp(p_comp) then raise exception 'sin_permiso_componente' using errcode = '42501'; end if;
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
declare sid text; cambio jsonb; v_comp text;
begin
  select comp into v_comp from public.hitos where id = p_id;
  if v_comp is null then raise exception 'hito_inexistente' using errcode = 'P0002'; end if;
  if not public.puede_comp(v_comp) then raise exception 'sin_permiso_componente' using errcode = '42501'; end if;
  for sid, cambio in select * from jsonb_each(p_cambios) loop
    update public.hitos
       set ev = jsonb_set(ev, array[sid], coalesce(ev -> sid, '{}'::jsonb) || cambio, true),
           editado_en = now(), editado_por = public.mi_correo()
     where id = p_id;
  end loop;
end $$;

-- ---------- 2. Juicios formativos por instancia de evaluación ----------
-- Una fila por (instancia, componente, estudiante). El juicio del grupo usa sujeto = '_grupo'.
create table if not exists public.juicios (
  id            text primary key,            -- "<instancia>|<componente>|<estudiante o _grupo>"
  instancia     text not null,
  comp          text not null,
  sujeto        text not null,
  nivel         text not null default '',     -- valoración global: v / a / r (opcional)
  logros        text not null default '',     -- estudiante: logros y fortalezas · grupo: desempeño del grupo
  mejorar       text not null default '',     -- estudiante: aspectos a mejorar · grupo: necesidades del grupo
  orientaciones text not null default '',     -- orientaciones y próximos pasos
  autor         text,
  creado_en     timestamptz not null default now(),
  editado_en    timestamptz not null default now(),
  editado_por   text
);
create index if not exists juicios_instancia_idx on public.juicios (instancia);

alter table public.juicios enable row level security;
drop policy if exists juicios_leer   on public.juicios;
drop policy if exists juicios_crear  on public.juicios;
drop policy if exists juicios_editar on public.juicios;
drop policy if exists juicios_borrar on public.juicios;
create policy juicios_leer   on public.juicios for select to authenticated using (public.es_docente());
create policy juicios_crear  on public.juicios for insert to authenticated with check (public.puede_comp(comp));
create policy juicios_editar on public.juicios for update to authenticated using (public.puede_comp(comp)) with check (public.puede_comp(comp));
create policy juicios_borrar on public.juicios for delete to authenticated using (public.es_coordinacion());

do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin alter publication supabase_realtime add table public.juicios; exception when duplicate_object then null; end;
  end if;
end $$;

-- ---------- 3. Las tres instancias (la coordinación puede cambiar nombres y fechas en Configuración) ----------
update public.config
   set data = data || jsonb_build_object('instancias', jsonb_build_array(
         jsonb_build_object('id','i1','nombre','Diagnóstico inicial','fecha','2026-11-30'),
         jsonb_build_object('id','i2','nombre','Evaluación de proceso (cierre del Módulo 1)','fecha','2026-12-23'),
         jsonb_build_object('id','i3','nombre','Evaluación final','fecha','2027-03-12')))
 where id = 1 and not (data ? 'instancias');
