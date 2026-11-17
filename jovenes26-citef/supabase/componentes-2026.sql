-- =====================================================================
--  Semáforo Jóvenes 26 · Componentes y docentes (lista de la coordinación, 17/11/2026)
--  Reemplaza la lista de componentes de la configuración. Se mantienen los identificadores
--  de los componentes que ya existían, así no se pierde nada de lo cargado.
--  «Ventas» deja de figurar (lo ya cargado en Ventas queda guardado, pero no se muestra).
--  Pegar en Supabase → SQL Editor → New query → Run.
-- =====================================================================
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
       editado_en = now(), editado_por = 'lista de la coordinación'
 where id = 1;

-- Comprobar: tiene que mostrar 13 componentes con su docente.
select c->>'nombre' as componente, c->>'docente' as docente
  from public.config, jsonb_array_elements(data->'componentes') c where id = 1;
