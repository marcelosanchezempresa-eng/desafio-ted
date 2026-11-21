-- Fotos de los participantes: espacio privado en Supabase Storage.
-- · Ver las fotos: solo docentes y coordinación autorizados (con su contraseña).
-- · Subir, cambiar o quitar: solo la coordinación.
-- · Cada foto se guarda como <id del participante>.jpg (por ejemplo e01.jpg), hasta 1 MB.
-- SQL Editor → New query → pegar → Run. Se puede correr más de una vez.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', false, 1048576, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists j26_fotos_ver     on storage.objects;
drop policy if exists j26_fotos_subir   on storage.objects;
drop policy if exists j26_fotos_cambiar on storage.objects;
drop policy if exists j26_fotos_quitar  on storage.objects;

create policy j26_fotos_ver     on storage.objects for select to authenticated using (bucket_id = 'fotos' and public.es_docente());
create policy j26_fotos_subir   on storage.objects for insert to authenticated with check (bucket_id = 'fotos' and public.es_coordinacion());
create policy j26_fotos_cambiar on storage.objects for update to authenticated using (bucket_id = 'fotos' and public.es_coordinacion()) with check (bucket_id = 'fotos' and public.es_coordinacion());
create policy j26_fotos_quitar  on storage.objects for delete to authenticated using (bucket_id = 'fotos' and public.es_coordinacion());

select id, public, file_size_limit from storage.buckets where id = 'fotos';
