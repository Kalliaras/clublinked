-- Add club banner support and private, club-scoped storage for club branding.
-- Objects in both buckets must be stored beneath `<club UUID>/...` so storage
-- authorization can be tied to the corresponding club role.

alter table public.clubs
  add column if not exists club_banner_image text;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  (
    'club-profile-images',
    'club-profile-images',
    false,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'club-banner-images',
    'club-banner-images',
    false,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  )
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Keep user_roles authorization independent of its own RLS policies.
create or replace function public.club_branding_can_manage(p_club_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles as manager_role
    where manager_role.club_id = p_club_id
      and manager_role.user_id = (select auth.uid())
      and (manager_role.is_owner or manager_role.is_admin)
  );
$$;

revoke all on function public.club_branding_can_manage(uuid) from public;
grant execute on function public.club_branding_can_manage(uuid) to authenticated;

-- Validate the path component before casting. CASE guarantees malformed paths
-- return false instead of raising an invalid UUID exception in an RLS policy.
create or replace function public.club_branding_can_manage_object(object_name text)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select case
    when (storage.foldername(object_name))[1] ~*
      '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    then public.club_branding_can_manage(
      ((storage.foldername(object_name))[1])::uuid
    )
    else false
  end;
$$;

revoke all on function public.club_branding_can_manage_object(text) from public;
grant execute on function public.club_branding_can_manage_object(text) to authenticated;

drop policy if exists "Club managers can read club branding" on storage.objects;
drop policy if exists "Club managers can create club branding" on storage.objects;
drop policy if exists "Club managers can update club branding" on storage.objects;
drop policy if exists "Club managers can delete club branding" on storage.objects;

create policy "Club managers can read club branding"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id in ('club-profile-images', 'club-banner-images')
    and public.club_branding_can_manage_object(name)
  );

create policy "Club managers can create club branding"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id in ('club-profile-images', 'club-banner-images')
    and public.club_branding_can_manage_object(name)
  );

create policy "Club managers can update club branding"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id in ('club-profile-images', 'club-banner-images')
    and public.club_branding_can_manage_object(name)
  )
  with check (
    bucket_id in ('club-profile-images', 'club-banner-images')
    and public.club_branding_can_manage_object(name)
  );

create policy "Club managers can delete club branding"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id in ('club-profile-images', 'club-banner-images')
    and public.club_branding_can_manage_object(name)
  );

-- Decode only the URL path portion used to identify a storage object. Signed
-- URL object names are percent-encoded, while storage.objects.name stores the
-- decoded UTF-8 name. Malformed percent escapes or invalid UTF-8 return null.
create or replace function public.club_branding_decode_object_path(
  encoded_path text
)
returns text
language plpgsql
immutable
strict
security invoker
set search_path = ''
as $$
declare
  decoded_bytes bytea := decode('', 'hex');
  cursor_position integer := 1;
  current_character text;
  hex_pair text;
begin
  while cursor_position <= char_length(encoded_path) loop
    current_character := substring(
      encoded_path from cursor_position for 1
    );

    if current_character = '%' then
      if cursor_position + 2 > char_length(encoded_path) then
        return null;
      end if;

      hex_pair := substring(encoded_path from cursor_position + 1 for 2);
      if hex_pair !~ '^[0-9A-Fa-f]{2}$' then
        return null;
      end if;

      decoded_bytes := decoded_bytes || decode(hex_pair, 'hex');
      cursor_position := cursor_position + 3;
    else
      decoded_bytes := decoded_bytes || convert_to(current_character, 'UTF8');
      cursor_position := cursor_position + 1;
    end if;
  end loop;

  return convert_from(decoded_bytes, 'UTF8');
exception
  when others then
    return null;
end;
$$;

revoke all on function public.club_branding_decode_object_path(text) from public;

-- Remove the earlier split-write API if it exists. Profile details and branding
-- must be published atomically through the validated function below.
drop function if exists public.update_club_branding(uuid, text, text);
drop function if exists public.update_club_profile(
  uuid,
  text,
  text,
  text,
  boolean
);

-- Avoid a broad clubs UPDATE policy: this RPC permits an authorized manager to
-- publish only the editable profile fields. Image URLs are checked against the
-- exact linked project, expected bucket and club folder, signed token, and the
-- corresponding storage.objects row before the single clubs update occurs.
create or replace function public.update_club_profile(
  p_club_id uuid,
  p_name text,
  p_description text,
  p_type text,
  p_uses_applications boolean,
  p_club_image text,
  p_club_banner_image text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_name text := btrim(p_name);
  normalized_description text := nullif(btrim(p_description), '');
  normalized_type text := nullif(btrim(p_type), '');
  logo_prefix constant text :=
    'https://kqxjwdtfwxuvuzntpsyo.supabase.co/storage/v1/object/sign/club-profile-images/'
    || p_club_id::text || '/';
  banner_prefix constant text :=
    'https://kqxjwdtfwxuvuzntpsyo.supabase.co/storage/v1/object/sign/club-banner-images/'
    || p_club_id::text || '/';
  logo_suffix text;
  banner_suffix text;
  logo_object_name text;
  banner_object_name text;
  logo_query text;
  banner_query text;
  current_club_image text;
  current_club_banner_image text;
begin
  if not public.club_branding_can_manage(p_club_id) then
    raise exception 'Only club owners and admins can update the club profile'
      using errcode = '42501';
  end if;

  select club.club_image, club.club_banner_image
  into current_club_image, current_club_banner_image
  from public.clubs as club
  where club.id = p_club_id;

  if not found then
    raise exception 'Club not found'
      using errcode = 'P0002';
  end if;

  if normalized_name is null
    or char_length(normalized_name) < 2
    or char_length(normalized_name) > 120
  then
    raise exception 'Club name must be between 2 and 120 characters'
      using errcode = '22023';
  end if;

  if normalized_description is not null
    and char_length(normalized_description) > 4000
  then
    raise exception 'Club description must be 4000 characters or fewer'
      using errcode = '22023';
  end if;

  if normalized_type is not null and char_length(normalized_type) > 80 then
    raise exception 'Club type must be 80 characters or fewer'
      using errcode = '22023';
  end if;

  if p_uses_applications is null then
    raise exception 'Application preference is required'
      using errcode = '22023';
  end if;

  if p_club_image is distinct from current_club_image
    and p_club_image is not null
  then
    if left(p_club_image, char_length(logo_prefix)) <> logo_prefix then
      raise exception 'Club logo URL must use this club''s profile image bucket'
        using errcode = '22023';
    end if;

    logo_suffix := substring(
      p_club_image from char_length(logo_prefix) + 1
    );
    if position('?' in logo_suffix) <= 1 then
      raise exception 'Club logo URL must contain an object path and signed token'
        using errcode = '22023';
    end if;

    logo_object_name := p_club_id::text || '/'
      || public.club_branding_decode_object_path(
        split_part(logo_suffix, '?', 1)
      );
    logo_query := substring(logo_suffix from position('?' in logo_suffix) + 1);

    if logo_object_name is null then
      raise exception 'Club logo URL contains an invalid encoded object path'
        using errcode = '22023';
    end if;

    if logo_query !~ '^token=[A-Za-z0-9._~-]+$' then
      raise exception 'Club logo URL must contain a nonempty signed token'
        using errcode = '22023';
    end if;

    if not exists (
      select 1
      from storage.objects as logo_object
      where logo_object.bucket_id = 'club-profile-images'
        and logo_object.name = logo_object_name
    ) then
      raise exception 'Club logo object does not exist'
        using errcode = '22023';
    end if;
  end if;

  if p_club_banner_image is distinct from current_club_banner_image
    and p_club_banner_image is not null
  then
    if left(p_club_banner_image, char_length(banner_prefix)) <> banner_prefix then
      raise exception 'Club banner URL must use this club''s banner image bucket'
        using errcode = '22023';
    end if;

    banner_suffix := substring(
      p_club_banner_image from char_length(banner_prefix) + 1
    );
    if position('?' in banner_suffix) <= 1 then
      raise exception 'Club banner URL must contain an object path and signed token'
        using errcode = '22023';
    end if;

    banner_object_name := p_club_id::text || '/'
      || public.club_branding_decode_object_path(
        split_part(banner_suffix, '?', 1)
      );
    banner_query := substring(
      banner_suffix from position('?' in banner_suffix) + 1
    );

    if banner_object_name is null then
      raise exception 'Club banner URL contains an invalid encoded object path'
        using errcode = '22023';
    end if;

    if banner_query !~ '^token=[A-Za-z0-9._~-]+$' then
      raise exception 'Club banner URL must contain a nonempty signed token'
        using errcode = '22023';
    end if;

    if not exists (
      select 1
      from storage.objects as banner_object
      where banner_object.bucket_id = 'club-banner-images'
        and banner_object.name = banner_object_name
    ) then
      raise exception 'Club banner object does not exist'
        using errcode = '22023';
    end if;
  end if;

  update public.clubs
  set
    name = normalized_name,
    description = normalized_description,
    type = normalized_type,
    uses_applications = p_uses_applications,
    club_image = p_club_image,
    club_banner_image = p_club_banner_image,
    updated_at = now()
  where id = p_club_id;

  if not found then
    raise exception 'Club not found'
      using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.update_club_profile(
  uuid,
  text,
  text,
  text,
  boolean,
  text,
  text
) from public;
grant execute on function public.update_club_profile(
  uuid,
  text,
  text,
  text,
  boolean,
  text,
  text
) to authenticated;
