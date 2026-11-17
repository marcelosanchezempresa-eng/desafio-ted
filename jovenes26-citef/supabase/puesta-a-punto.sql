-- =====================================================================
--  Semáforo Jóvenes 26 · PUESTA A PUNTO (17/11/2026)
--  Ejecutar DESPUÉS de componentes-e-instancias.sql.
--  1) Borra las clases y los hitos de PRUEBA (creados antes del 17/11/2026).
--  2) Borra lo cargado en componentes que ya no existen (por ejemplo, «Ventas»).
--  3) Carga los 13 componentes con sus docentes, según la coordinación.
--  4) Muestra los docentes autorizados, para revisar quién está mal cargado.
--  NO toca: estudiantes, configuración del curso ni contraseñas.
--  Pegar en Supabase → SQL Editor → New query → Run (confirmar el aviso).
-- =====================================================================

-- 1) Datos de prueba
delete from public.clases where creado_en < timestamptz '2026-11-17 00:00:00-03';
delete from public.hitos  where creado_en < timestamptz '2026-11-17 00:00:00-03';

-- 2) Datos en componentes que ya no forman parte del curso
delete from public.clases  where comp not in ('lectoescritura','genero','administracion','informatica','marketing','marketingredes','proyecto','contabilidad','derecho','comunicacion','sexualidad','acompanamiento','emprendimiento');
delete from public.hitos   where comp not in ('lectoescritura','genero','administracion','informatica','marketing','marketingredes','proyecto','contabilidad','derecho','comunicacion','sexualidad','acompanamiento','emprendimiento');
delete from public.juicios where comp not in ('lectoescritura','genero','administracion','informatica','marketing','marketingredes','proyecto','contabilidad','derecho','comunicacion','sexualidad','acompanamiento','emprendimiento');
update public.docentes set componentes = array(
  select c from unnest(componentes) c
   where c in ('lectoescritura','genero','administracion','informatica','marketing','marketingredes','proyecto','contabilidad','derecho','comunicacion','sexualidad','acompanamiento','emprendimiento'));

-- 3) Los 13 componentes con sus docentes
update public.config
   set data = jsonb_set(data, '{componentes}', '[
     {"id":"lectoescritura",  "nombre":"Lecto Escritura",               "docente":"Marcelo Sánchez",                       "horas":"", "modulo":"t"},
     {"id":"genero",          "nombre":"Género",                        "docente":"Rossana Hernández y Patricia Rodríguez", "horas":"", "modulo":"t"},
     {"id":"administracion",  "nombre":"Administración",                "docente":"Natalia López",                         "horas":"", "modulo":"t"},
     {"id":"informatica",     "nombre":"Informática",                   "docente":"Arturo Olivera",                        "horas":"", "modulo":"t"},
     {"id":"marketing",       "nombre":"Marketing Digital",             "docente":"Leticia Listur",                        "horas":"", "modulo":"t"},
     {"id":"marketingredes",  "nombre":"Marketing y Redes",             "docente":"Belén Sánchez",                         "horas":"", "modulo":"t"},
     {"id":"proyecto",        "nombre":"Proyecto Ocupacional",          "docente":"Magdalena Estrade y María Cristech",    "horas":"", "modulo":"t"},
     {"id":"contabilidad",    "nombre":"Contabilidad y Cálculo",        "docente":"Laura Varela",                          "horas":"", "modulo":"t"},
     {"id":"derecho",         "nombre":"Derecho Laboral",               "docente":"Luciana De León",                       "horas":"", "modulo":"t"},
     {"id":"comunicacion",    "nombre":"Comunicación",                  "docente":"Cecilia Tarde",                         "horas":"", "modulo":"t"},
     {"id":"sexualidad",      "nombre":"Sexualidad",                    "docente":"Luciana Urbeltz y Andrea Iturburua",    "horas":"", "modulo":"t"},
     {"id":"acompanamiento",  "nombre":"Acompañamiento socio laboral",  "docente":"Eugenia Andrada y Natalia López",       "horas":"", "modulo":"t"},
     {"id":"emprendimiento",  "nombre":"Emprendimiento",                "docente":"Paula Rodáo",                           "horas":"", "modulo":"t"}
   ]'::jsonb),
       editado_en = now(), editado_por = 'puesta a punto 17/11'
 where id = 1;

-- 4) Para revisar: docentes autorizados hoy (copiá este resultado y mandáselo a Claude)
select email, nombre, rol, case when activo then 'activo' else 'dado de baja' end as estado,
       array_to_string(componentes, ', ') as componentes
  from public.docentes order by rol, nombre;
