-- Carga el horario de las semanas del 16/11, 23/11 y 30/11/2026 (según la captura de la coordinación).
-- No pisa lo que ya se haya editado desde la app: solo completa los bloques que falten.
-- También fija los dos bloques horarios: 8:15 a 10:00 y 10:15 a 12:00.
-- SQL Editor → New query → pegar → Run.

update public.config
set data = jsonb_set(
             jsonb_set(data, '{horario}', $j26${
 "2026-11-16|1": {
  "c": "administracion"
 },
 "2026-11-16|2": {
  "c": "",
  "t": "PO TOLS",
  "col": "#ffe45c"
 },
 "2026-11-17|1": {
  "c": "derecho"
 },
 "2026-11-17|2": {
  "c": "contabilidad"
 },
 "2026-11-18|1": {
  "c": "lectoescritura"
 },
 "2026-11-18|2": {
  "c": "contabilidad"
 },
 "2026-11-19|1": {
  "c": "emprendimiento"
 },
 "2026-11-19|2": {
  "c": "",
  "t": "PO TOLS",
  "col": "#ffe45c"
 },
 "2026-11-20|1": {
  "c": "informatica"
 },
 "2026-11-20|2": {
  "c": "informatica"
 },
 "2026-11-23|1": {
  "c": "administracion"
 },
 "2026-11-23|2": {
  "c": "",
  "t": "PO TOLS",
  "col": "#ffe45c"
 },
 "2026-11-24|1": {
  "c": "derecho"
 },
 "2026-11-24|2": {
  "c": "genero",
  "t": "DAT",
  "col": "#f27ef2"
 },
 "2026-11-25|1": {
  "c": "lectoescritura"
 },
 "2026-11-25|2": {
  "c": "contabilidad"
 },
 "2026-11-26|1": {
  "c": "informatica"
 },
 "2026-11-26|2": {
  "c": "",
  "t": "PO TOLS",
  "col": "#ffe45c"
 },
 "2026-11-27|1": {
  "c": "informatica"
 },
 "2026-11-27|2": {
  "c": "lectoescritura"
 },
 "2026-11-30|1": {
  "c": "administracion"
 },
 "2026-11-30|2": {
  "c": "",
  "t": "PO TOLS",
  "col": "#ffe45c"
 },
 "2026-12-01|1": {
  "c": "derecho"
 },
 "2026-12-02|1": {
  "c": "lectoescritura"
 },
 "2026-12-02|2": {
  "c": "contabilidad"
 },
 "2026-12-03|1": {
  "c": "emprendimiento"
 },
 "2026-12-03|2": {
  "c": "",
  "t": "PO TOLS",
  "col": "#ffe45c"
 },
 "2026-12-04|1": {
  "c": "informatica"
 },
 "2026-12-04|2": {
  "c": "lectoescritura"
 }
}$j26$::jsonb || coalesce(data->'horario', '{}'::jsonb), true),
             '{bloques}', coalesce(data->'bloques', '[{"id":"1","desde":"08:15","hasta":"10:00"},{"id":"2","desde":"10:15","hasta":"12:00"}]'::jsonb), true),
    editado_en = now()
where id = 1;

-- DAT (24/11, 10:15) corresponde a Género: se vincula al componente y se sigue mostrando como «DAT».
-- Corrige también el caso en que este archivo ya se había corrido con la versión anterior.
update public.config
set data = jsonb_set(data, '{horario,2026-11-24|2}', '{"c":"genero","t":"DAT","col":"#f27ef2"}'::jsonb)
where id = 1
  and coalesce(data->'horario'->'2026-11-24|2'->>'c', '') = ''
  and data->'horario'->'2026-11-24|2'->>'t' = 'DAT';

select count(*) as bloques_cargados from public.config, jsonb_object_keys(data->'horario') where id = 1;
