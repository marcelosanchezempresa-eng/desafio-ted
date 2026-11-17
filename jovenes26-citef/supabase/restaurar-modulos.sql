-- Vuelve a cargar los módulos del curso si se borraron por error desde Configuración.
-- Solo actúa si hoy hay menos de 2 módulos. No toca estudiantes, componentes, instancias ni calificaciones.
-- SQL Editor → New query → pegar → Run.

update public.config
set data = jsonb_set(data, '{modulos}', '[
  {"id":"m1","nombre":"Módulo 1","desde":"2026-10-13","hasta":"2026-12-23"},
  {"id":"m2","nombre":"Módulo 2","desde":"2027-02-01","hasta":"2027-03-15"}
]'::jsonb, true),
    editado_en = now()
where id = 1
  and coalesce(jsonb_array_length(case when jsonb_typeof(data->'modulos') = 'array' then data->'modulos' end), 0) < 2;

select jsonb_pretty(data->'modulos') as modulos_actuales from public.config where id = 1;
