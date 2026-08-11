-- Chef Chakim's Yummys — Storage Bucket & Menu Item Management

-- 1. Create storage bucket for menu item photos if it doesn't exist
insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do nothing;

-- 2. Storage Policies for menu-images bucket
drop policy if exists "Public read menu images" on storage.objects;
drop policy if exists "Admin insert menu images" on storage.objects;
drop policy if exists "Admin update menu images" on storage.objects;
drop policy if exists "Admin delete menu images" on storage.objects;

-- Allow public read access to food pictures
create policy "Public read menu images"
  on storage.objects for select
  using (bucket_id = 'menu-images');

-- Allow authenticated admins to upload food pictures
create policy "Admin insert menu images"
  on storage.objects for insert
  with check (bucket_id = 'menu-images' and public.is_admin());

-- Allow authenticated admins to update food pictures
create policy "Admin update menu images"
  on storage.objects for update
  using (bucket_id = 'menu-images' and public.is_admin())
  with check (bucket_id = 'menu-images' and public.is_admin());

-- Allow authenticated admins to delete food pictures
create policy "Admin delete menu images"
  on storage.objects for delete
  using (bucket_id = 'menu-images' and public.is_admin());
