-- Documentos de los casos: almacenamiento privado en Supabase Storage.
-- Ejecutar en el SQL Editor del proyecto. Se puede correr más de una vez.
--
-- Cada archivo vive en documentos/<id del usuario>/<id del caso>/<archivo>.
-- Las políticas solo dejan ver, subir y borrar dentro de la carpeta del propio usuario:
-- nadie más (ni otra cuenta, ni alguien sin sesión) puede acceder a esos archivos.

insert into storage.buckets (id, name, public, file_size_limit)
values ('documentos', 'documentos', false, 10485760)  -- privado, hasta 10 MB por archivo
on conflict (id) do update set public = false, file_size_limit = 10485760;

drop policy if exists "documentos_ver_propios" on storage.objects;
create policy "documentos_ver_propios" on storage.objects
  for select to authenticated
  using (bucket_id = 'documentos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "documentos_subir_propios" on storage.objects;
create policy "documentos_subir_propios" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'documentos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "documentos_borrar_propios" on storage.objects;
create policy "documentos_borrar_propios" on storage.objects
  for delete to authenticated
  using (bucket_id = 'documentos' and (storage.foldername(name))[1] = auth.uid()::text);
