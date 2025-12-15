-- Create storage bucket for recap images
insert into storage.buckets (id, name, public)
values ('recap-images', 'recap-images', true)
on conflict (id) do nothing;

-- Policy: Users can upload images to their own folder
create policy "Users can upload own images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'recap-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own images
create policy "Users can update own images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'recap-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own images
create policy "Users can delete own images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'recap-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Anyone can view images (public bucket)
create policy "Anyone can view images"
on storage.objects for select
to public
using (bucket_id = 'recap-images');
