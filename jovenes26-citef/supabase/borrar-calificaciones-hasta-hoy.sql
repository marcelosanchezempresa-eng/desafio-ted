-- =====================================================================
--  Semáforo Jóvenes 26 · EMPEZAR DE CERO las calificaciones
--  Borra TODO lo cargado hasta el 17/11/2026 inclusive (hora de Uruguay):
--  clases (asistencia, actitud, comunicación, cumplimiento), hitos y juicios.
--  Lo que se cargue desde el 18/11/2026 en adelante NO se borra, aunque este
--  archivo se ejecute más tarde, y aunque la clase sea de una fecha anterior.
--  NO toca: estudiantes, componentes, configuración, docentes ni contraseñas.
--  Pegar en Supabase → SQL Editor → New query → Run (confirmar el aviso).
-- =====================================================================
delete from public.clases  where creado_en < timestamptz '2026-11-18 00:00:00-03';
delete from public.hitos   where creado_en < timestamptz '2026-11-18 00:00:00-03';
delete from public.juicios where creado_en < timestamptz '2026-11-18 00:00:00-03';

-- Comprobar: si se ejecuta antes del 18/11, los tres números tienen que ser 0
select (select count(*) from public.clases)  as clases,
       (select count(*) from public.hitos)   as hitos,
       (select count(*) from public.juicios) as juicios;
