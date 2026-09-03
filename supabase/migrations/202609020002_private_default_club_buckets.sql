-- Keep curated defaults available through the app's bundled public assets while
-- removing direct public access to their Supabase Storage source buckets.

update storage.buckets
set public = false
where id in ('club-default-images', 'club-default-profile-images');

update public.clubs
set club_banner_image = replace(
  club_banner_image,
  'https://kqxjwdtfwxuvuzntpsyo.supabase.co/storage/v1/object/public/club-default-images/banners/',
  '/default-banners/'
)
where club_banner_image like
  'https://kqxjwdtfwxuvuzntpsyo.supabase.co/storage/v1/object/public/club-default-images/banners/%';

update public.clubs
set club_image = replace(
  club_image,
  'https://kqxjwdtfwxuvuzntpsyo.supabase.co/storage/v1/object/public/club-default-profile-images/profiles/',
  '/default-profile-images/'
)
where club_image like
  'https://kqxjwdtfwxuvuzntpsyo.supabase.co/storage/v1/object/public/club-default-profile-images/profiles/%';

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
  legacy_default_prefix text := storage_base || 'public/' || p_default_bucket || '/'
    || p_default_folder || '/';
  app_default_prefix text := case
    when p_default_bucket = 'club-default-images' then '/default-banners/'
    when p_default_bucket = 'club-default-profile-images' then '/default-profile-images/'
    else '/invalid-default-bucket/'
  end;
  url_suffix text;
  decoded_suffix text;
  object_name text;
  query_string text;
begin
  if p_url is null then
    return true;
  end if;

  if left(p_url, char_length(app_default_prefix)) = app_default_prefix then
    url_suffix := substring(p_url from char_length(app_default_prefix) + 1);
  elsif left(p_url, char_length(legacy_default_prefix)) = legacy_default_prefix then
    url_suffix := substring(p_url from char_length(legacy_default_prefix) + 1);
  else
    url_suffix := null;
  end if;

  if url_suffix is not null then
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
