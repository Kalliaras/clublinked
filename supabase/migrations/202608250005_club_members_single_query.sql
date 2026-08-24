-- Return the member directory in one RLS-aware database call instead of
-- fetching roles first and profiles second.
create or replace function public.get_club_members(p_club_id uuid)
returns table (
  user_id uuid,
  title text,
  is_owner boolean,
  first_name text,
  last_name text,
  major text,
  academic_year text
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    role.user_id,
    role.title,
    role.is_owner,
    profile.first_name,
    profile.last_name,
    profile.major,
    profile.academic_year
  from public.user_roles as role
  join public.profiles as profile on profile.id = role.user_id
  where role.club_id = p_club_id
  order by role.is_owner desc, profile.first_name, profile.last_name;
$$;

revoke all on function public.get_club_members(uuid) from public;
grant execute on function public.get_club_members(uuid) to anon, authenticated;

create index if not exists club_projects_club_created_at_idx
  on public.club_projects (club_id, created_at desc);

create index if not exists club_announcements_club_created_at_idx
  on public.club_announcements (club_id, created_at desc);

create index if not exists club_events_club_time_idx
  on public.club_events (club_id, time);
