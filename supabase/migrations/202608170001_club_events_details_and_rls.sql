-- Add event classification, visibility, and location, then lock event access to
-- public visibility or the event's club membership.

alter table public.club_events
  add column if not exists event_type text not null default 'event',
  add column if not exists status text not null default 'public',
  add column if not exists location text not null default 'To be announced';

alter table public.club_events
  drop constraint if exists club_events_status_check;

alter table public.club_events
  add constraint club_events_status_check
  check (status in ('public', 'members_only'));

create index if not exists club_events_club_id_idx
  on public.club_events (club_id);

create index if not exists club_events_public_time_idx
  on public.club_events (time)
  where status = 'public';

-- Security-definer helpers keep authorization independent of user_roles RLS
-- while exposing only boolean membership checks to event policies.
create or replace function public.club_events_is_member(p_club_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles as member_role
    where member_role.club_id = p_club_id
      and member_role.user_id = (select auth.uid())
  );
$$;

create or replace function public.club_events_can_manage(p_club_id uuid)
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

revoke all on function public.club_events_is_member(uuid) from public;
revoke all on function public.club_events_can_manage(uuid) from public;
grant execute on function public.club_events_is_member(uuid) to authenticated;
grant execute on function public.club_events_can_manage(uuid) to authenticated;

alter table public.club_events enable row level security;

-- Replace the policy set as a unit so an older permissive policy cannot remain
-- OR-ed with the least-privilege policies below.
do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'club_events'
  loop
    execute format(
      'drop policy if exists %I on public.club_events',
      existing_policy.policyname
    );
  end loop;
end;
$$;

create policy "Public events are readable"
  on public.club_events
  for select
  to anon, authenticated
  using (status = 'public');

create policy "Club members can read member events"
  on public.club_events
  for select
  to authenticated
  using (
    status = 'members_only'
    and public.club_events_is_member(club_id)
  );

create policy "Club managers can create events"
  on public.club_events
  for insert
  to authenticated
  with check (public.club_events_can_manage(club_id));

create policy "Club managers can update events"
  on public.club_events
  for update
  to authenticated
  using (public.club_events_can_manage(club_id))
  with check (public.club_events_can_manage(club_id));

create policy "Club managers can delete events"
  on public.club_events
  for delete
  to authenticated
  using (public.club_events_can_manage(club_id));
