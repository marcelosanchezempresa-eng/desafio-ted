-- =====================================================================
--  Semáforo Jóvenes 26 · Empezar de cero la lista de DOCENTES AUTORIZADOS
--  Borra a todos los docentes autorizados, MENOS a Marcelo Sánchez (coordinación),
--  para que siempre quede alguien que pueda entrar y autorizar a los demás.
--  NO borra calificaciones, hitos, juicios, estudiantes ni configuración.
--  Las contraseñas que ya crearon siguen sirviendo cuando se los vuelva a autorizar.
--  Pegar en Supabase → SQL Editor → New query → Run (confirmar el aviso).
-- =====================================================================
delete from public.docentes where email <> 'marcelosanchezempresa@gmail.com';

insert into public.docentes (email, nombre, rol, activo)
values ('marcelosanchezempresa@gmail.com', 'Marcelo Sánchez', 'coordinacion', true)
on conflict (email) do update set rol = 'coordinacion', activo = true;

-- Tiene que quedar una sola fila: la suya.
select email, nombre, rol from public.docentes;
