-- Public, app-managed defaults that can be reused by any club without signed
-- URLs. Generated banners live under the `banners/` object prefix.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'club-default-images',
  'club-default-images',
  true,
  1048576,
  array['image/png', 'image/webp']
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Intentionally no INSERT/UPDATE/DELETE policies: these curated assets are
-- deployed by the project tooling, not writable by application users.
