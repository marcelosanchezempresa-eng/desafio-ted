-- Evidencias: archivos adjuntos en Evaluaciones y en Hitos (espacio privado en Supabase Storage).
-- · Ver y descargar: docentes y coordinación autorizados.
-- · Subir y quitar: el docente del componente y la coordinación (misma regla que las calificaciones).
-- · Hasta 50 MB por archivo: documentos (Word, PDF, PowerPoint, Excel), imágenes, audio y video.
-- Cada archivo se guarda en <componente>/eval/<instancia>/<participante o _actividad>/… o en <componente>/hito/<hito>/…
-- SQL Editor → New query → pegar → Run. Se puede correr más de una vez.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('evidencias', 'evidencias', false, 52428800, array[
  'application/pdf', 'text/plain', 'application/octet-stream',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.oasis.opendocument.text', 'application/vnd.oasis.opendocument.presentation', 'application/vnd.oasis.opendocument.spreadsheet',
  'image/*', 'video/*', 'audio/*'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists j26_evid_ver    on storage.objects;
drop policy if exists j26_evid_subir  on storage.objects;
drop policy if exists j26_evid_quitar on storage.objects;

create policy j26_evid_ver    on storage.objects for select to authenticated
  using (bucket_id = 'evidencias' and public.es_docente());
create policy j26_evid_subir  on storage.objects for insert to authenticated
  with check (bucket_id = 'evidencias' and public.puede_comp((storage.foldername(name))[1]));
create policy j26_evid_quitar on storage.objects for delete to authenticated
  using (bucket_id = 'evidencias' and public.puede_comp((storage.foldername(name))[1]));

-- Comprobación: tiene que mostrar el espacio «evidencias» (privado) y los 3 permisos.
select 'espacio' as que, id as nombre, case when public then 'PÚBLICO (revisar)' else 'privado · ' || (file_size_limit / 1048576) || ' MB por archivo' end as detalle
from storage.buckets where id = 'evidencias'
union all
select 'permiso', policyname::text, cmd::text from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname like 'j26_evid%'
order by 1, 2;
