-- =====================================================================
--  Semáforo Jóvenes 26 · Hitos de evaluación según INEFOP
--  Hito 1 (30/11/2026): diagnóstico inicial, juicio conceptual, sin nota.
--  Hito 4 (30/04/2027): evaluación final, nota de 1 a 12 y rúbrica de
--  competencias transversales (comunicación asertiva, trabajo colaborativo,
--  orientación a objetivos).
--  Ejecutar DESPUÉS de componentes-e-instancias.sql.
--  Pegar en Supabase → SQL Editor → New query → Run. Se puede volver a ejecutar.
-- =====================================================================

-- Nota final (1 a 12) y rúbrica de competencias transversales en cada juicio
alter table public.juicios add column if not exists nota smallint;
alter table public.juicios add column if not exists rubrica jsonb not null default '{}'::jsonb;
alter table public.juicios drop constraint if exists juicios_nota_1_12;
alter table public.juicios add constraint juicios_nota_1_12 check (nota is null or nota between 1 and 12);

-- Instancias: las dos que exige INEFOP (la coordinación puede agregar otras en Configuración)
update public.config
   set data = data || jsonb_build_object('instancias', jsonb_build_array(
         jsonb_build_object('id','i1','nombre','Hito 1 · Diagnóstico inicial','fecha','2026-11-30','tipo','diagnostico'),
         jsonb_build_object('id','i4','nombre','Hito 4 · Evaluación final','fecha','2027-04-30','tipo','final'))),
       editado_en = now(), editado_por = 'hitos INEFOP'
 where id = 1;

-- Comprobar
select i->>'nombre' as instancia, i->>'fecha' as fecha, i->>'tipo' as tipo
  from public.config, jsonb_array_elements(data->'instancias') i where id = 1;
