-- =====================================================================
--  Semáforo Jóvenes 26 · Borrar los datos cargados para PROBAR la aplicación
--  Borra las clases y los hitos registrados ANTES del martes 17/11/2026 (hora de Uruguay).
--  NO toca: estudiantes, componentes, configuración ni docentes autorizados.
--
--  PASO 1: ejecutá solo la parte «VER» (seleccioná esas líneas y tocá Run) y revisá la lista.
--  PASO 2: si es todo de prueba, ejecutá el archivo completo.
-- =====================================================================

-- ---------- VER: qué se va a borrar ----------
select 'clase' as tipo, fecha::text as fecha, comp as componente, editado_por as cargado_por, creado_en
  from public.clases where creado_en < timestamptz '2026-11-17 00:00:00-03'
union all
select 'hito', fecha::text, comp || ' · ' || nombre, editado_por, creado_en
  from public.hitos  where creado_en < timestamptz '2026-11-17 00:00:00-03'
order by creado_en;

-- ---------- BORRAR ----------
delete from public.clases where creado_en < timestamptz '2026-11-17 00:00:00-03';
delete from public.hitos  where creado_en < timestamptz '2026-11-17 00:00:00-03';

-- ---------- COMPROBAR: lo que queda ----------
select (select count(*) from public.clases) as clases_que_quedan,
       (select count(*) from public.hitos)  as hitos_que_quedan;
