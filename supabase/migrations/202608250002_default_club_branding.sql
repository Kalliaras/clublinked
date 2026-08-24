-- Add curated default profile images, permit both curated public defaults and
-- private club uploads in the profile RPC, and backfill existing clubs.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'club-default-profile-images',
  'club-default-profile-images',
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

create or replace function public.club_branding_url_is_allowed(
  p_url text,
  p_club_id uuid,
  p_private_bucket text,
  p_default_bucket text,
  p_default_folder text
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  storage_base constant text :=
    'https://kqxjwdtfwxuvuzntpsyo.supabase.co/storage/v1/object/';
  private_prefix text := storage_base || 'sign/' || p_private_bucket || '/'
    || p_club_id::text || '/';
  default_prefix text := storage_base || 'public/' || p_default_bucket || '/'
    || p_default_folder || '/';
  url_suffix text;
  decoded_suffix text;
  object_name text;
  query_string text;
begin
  if p_url is null then
    return true;
  end if;

  if left(p_url, char_length(default_prefix)) = default_prefix then
    url_suffix := substring(p_url from char_length(default_prefix) + 1);
    if url_suffix = '' or position('?' in url_suffix) > 0 then
      return false;
    end if;

    decoded_suffix := public.club_branding_decode_object_path(url_suffix);
    if decoded_suffix is null
      or decoded_suffix !~ '^default-[a-z0-9-]+[.]png$'
    then
      return false;
    end if;

    object_name := p_default_folder || '/' || decoded_suffix;
    return exists (
      select 1
      from storage.objects as default_object
      where default_object.bucket_id = p_default_bucket
        and default_object.name = object_name
    );
  end if;

  if left(p_url, char_length(private_prefix)) <> private_prefix then
    return false;
  end if;

  url_suffix := substring(p_url from char_length(private_prefix) + 1);
  if position('?' in url_suffix) <= 1 then
    return false;
  end if;

  decoded_suffix := public.club_branding_decode_object_path(
    split_part(url_suffix, '?', 1)
  );
  query_string := substring(url_suffix from position('?' in url_suffix) + 1);
  if decoded_suffix is null
    or query_string !~ '^token=[A-Za-z0-9._~-]+$'
  then
    return false;
  end if;

  object_name := p_club_id::text || '/' || decoded_suffix;
  return exists (
    select 1
    from storage.objects as private_object
    where private_object.bucket_id = p_private_bucket
      and private_object.name = object_name
  );
end;
$$;

revoke all on function public.club_branding_url_is_allowed(
  text,
  uuid,
  text,
  text,
  text
) from public;

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
    raise exception 'Club not found' using errcode = 'P0002';
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
    and not public.club_branding_url_is_allowed(
      p_club_image,
      p_club_id,
      'club-profile-images',
      'club-default-profile-images',
      'profiles'
    )
  then
    raise exception 'Club logo must be a ClubLinked default or a valid club upload'
      using errcode = '22023';
  end if;

  if p_club_banner_image is distinct from current_club_banner_image
    and not public.club_branding_url_is_allowed(
      p_club_banner_image,
      p_club_id,
      'club-banner-images',
      'club-default-images',
      'banners'
    )
  then
    raise exception 'Club banner must be a ClubLinked default or a valid club upload'
      using errcode = '22023';
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
    raise exception 'Club not found' using errcode = 'P0002';
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

with ranked_clubs as (
  select id, row_number() over (order by id) as position
  from public.clubs
  where club_banner_image is null
)
update public.clubs as club
set
  club_banner_image = case ((ranked.position - 1) % 4)
    when 0 then 'https://kqxjwdtfwxuvuzntpsyo.supabase.co/storage/v1/object/public/club-default-images/banners/default-blue.png'
    when 1 then 'https://kqxjwdtfwxuvuzntpsyo.supabase.co/storage/v1/object/public/club-default-images/banners/default-violet.png'
    when 2 then 'https://kqxjwdtfwxuvuzntpsyo.supabase.co/storage/v1/object/public/club-default-images/banners/default-teal.png'
    else 'https://kqxjwdtfwxuvuzntpsyo.supabase.co/storage/v1/object/public/club-default-images/banners/default-coral.png'
  end,
  updated_at = now()
from ranked_clubs as ranked
where club.id = ranked.id;

with ranked_clubs as (
  select id, row_number() over (order by id) as position
  from public.clubs
  where club_image is null
)
update public.clubs as club
set
  club_image = case ((ranked.position - 1) % 4)
    when 0 then 'https://kqxjwdtfwxuvuzntpsyo.supabase.co/storage/v1/object/public/club-default-profile-images/profiles/default-blue.png'
    when 1 then 'https://kqxjwdtfwxuvuzntpsyo.supabase.co/storage/v1/object/public/club-default-profile-images/profiles/default-violet.png'
    when 2 then 'https://kqxjwdtfwxuvuzntpsyo.supabase.co/storage/v1/object/public/club-default-profile-images/profiles/default-teal.png'
    else 'https://kqxjwdtfwxuvuzntpsyo.supabase.co/storage/v1/object/public/club-default-profile-images/profiles/default-coral.png'
  end,
  updated_at = now()
from ranked_clubs as ranked
where club.id = ranked.id;
