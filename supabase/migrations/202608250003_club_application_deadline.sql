-- Let clubs publish an application closing time and support deadline-ordered
-- discovery without scanning clubs that do not use applications.
alter table public.clubs
  add column if not exists application_deadline timestamptz;

create index if not exists clubs_application_deadline_idx
  on public.clubs (application_deadline)
  where uses_applications = true and application_deadline is not null;

drop function if exists public.update_club_profile(
  uuid,
  text,
  text,
  text,
  boolean,
  text,
  text
);

create function public.update_club_profile(
  p_club_id uuid,
  p_name text,
  p_description text,
  p_type text,
  p_uses_applications boolean,
  p_application_deadline timestamptz,
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

  if not p_uses_applications and p_application_deadline is not null then
    raise exception 'Only clubs using applications can set an application deadline'
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
    application_deadline = case
      when p_uses_applications then p_application_deadline
      else null
    end,
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
  timestamptz,
  text,
  text
) from public;
grant execute on function public.update_club_profile(
  uuid,
  text,
  text,
  text,
  boolean,
  timestamptz,
  text,
  text
) to authenticated;
