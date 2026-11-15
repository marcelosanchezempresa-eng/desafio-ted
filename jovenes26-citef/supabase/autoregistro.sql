-- =====================================================================
--  Semáforo Jóvenes 26 · Auto-registro de docentes
--  Cada docente crea su propia contraseña la primera vez que entra,
--  PERO solo si la coordinación autorizó su correo antes.
--  Pegar en Supabase → SQL Editor → New query → Run (después de esquema.sql).
--  Se puede volver a ejecutar sin problema.
-- =====================================================================

-- 1) Nadie puede crearse una cuenta con un correo que no esté autorizado.
create or replace function public.solo_correos_autorizados()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.docentes d where d.email = lower(new.email) and d.activo) then
    raise exception 'correo_no_autorizado' using errcode = '42501';
  end if;
  return new;
end $$;

drop trigger if exists j26_solo_autorizados on auth.users;
create trigger j26_solo_autorizados
  before insert on auth.users
  for each row execute function public.solo_correos_autorizados();

-- 2) Contraseña olvidada: la coordinación «reinicia» la cuenta del docente.
--    Se borra solo la cuenta de ingreso; las calificaciones quedan (se guardan por correo).
--    Después el docente vuelve a crear su contraseña desde la pantalla de ingreso.
create or replace function public.reiniciar_acceso(p_email text)
returns boolean language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not public.es_coordinacion() then raise exception 'sin_permiso' using errcode = '42501'; end if;
  if lower(p_email) = public.mi_correo() then raise exception 'no_a_si_mismo' using errcode = '42501'; end if;
  delete from auth.users where lower(email) = lower(p_email);
  get diagnostics n = row_count;
  return n > 0;
end $$;

revoke all on function public.reiniciar_acceso(text) from public, anon;
grant execute on function public.reiniciar_acceso(text) to authenticated;
revoke all on function public.solo_correos_autorizados() from public, anon, authenticated;
