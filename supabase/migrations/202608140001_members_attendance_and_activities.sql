-- Member attendance, club-scoped activity history, and owner-managed roles.

alter table public.user_roles
  add column if not exists attendance_score smallint not null default 0;

alter table public.user_roles
  drop constraint if exists user_roles_attendance_score_check;

alter table public.user_roles
  add constraint user_roles_attendance_score_check
  check (attendance_score between 0 and 100);

-- Keep the requested database column name for compatibility with the product spec.
alter table public.clubs
  add column if not exists attandence_required smallint not null default 0;

alter table public.clubs
  drop constraint if exists clubs_attandence_required_check;

alter table public.clubs
  add constraint clubs_attandence_required_check
  check (attandence_required between 0 and 100);

create table if not exists public.user_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  club_id uuid not null references public.clubs(id) on delete cascade,
  activity text not null check (length(btrim(activity)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists user_activities_club_user_created_idx
  on public.user_activities (club_id, user_id, created_at desc);

alter table public.user_activities enable row level security;

drop policy if exists "Club members can read club activities" on public.user_activities;
create policy "Club members can read club activities"
  on public.user_activities
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.user_roles viewer_role
      where viewer_role.club_id = user_activities.club_id
        and viewer_role.user_id = auth.uid()
    )
  );

drop policy if exists "Users can record their own club activities" on public.user_activities;
create policy "Users can record their own club activities"
  on public.user_activities
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.user_roles viewer_role
      where viewer_role.club_id = user_activities.club_id
        and viewer_role.user_id = auth.uid()
    )
  );

create or replace function public.change_club_member_role(
  p_club_id uuid,
  p_user_id uuid,
  p_role text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_role public.user_roles%rowtype;
  target_name text;
begin
  if auth.uid() is null or not exists (
    select 1
    from public.user_roles owner_role
    where owner_role.club_id = p_club_id
      and owner_role.user_id = auth.uid()
      and owner_role.is_owner
  ) then
    raise exception 'Only a club owner can change member roles' using errcode = '42501';
  end if;

  if p_role not in ('Student', 'Admin', 'Owner') then
    raise exception 'Invalid member role' using errcode = '22023';
  end if;

  select *
  into target_role
  from public.user_roles
  where club_id = p_club_id
    and user_id = p_user_id
  for update;

  if not found then
    raise exception 'Club member not found' using errcode = 'P0002';
  end if;

  if target_role.is_owner and p_role <> 'Owner' and (
    select count(*)
    from public.user_roles
    where club_id = p_club_id
      and is_owner
  ) <= 1 then
    raise exception 'A club must always have at least one owner' using errcode = '23514';
  end if;

  update public.user_roles
  set is_owner = (p_role = 'Owner'),
      is_admin = (p_role in ('Owner', 'Admin')),
      title = case
        when p_role = 'Student' then 'Member'
        else p_role
      end,
      updated_at = now()
  where club_id = p_club_id
    and user_id = p_user_id;

  select nullif(btrim(concat_ws(' ', first_name, last_name)), '')
  into target_name
  from public.profiles
  where id = p_user_id;

  insert into public.user_activities (user_id, club_id, activity)
  values (
    auth.uid(),
    p_club_id,
    format('Changed %s''s role to %s', coalesce(target_name, 'a member'), p_role)
  );
end;
$$;

revoke all on function public.change_club_member_role(uuid, uuid, text) from public;
grant execute on function public.change_club_member_role(uuid, uuid, text) to authenticated;

create or replace function public.get_recent_club_member_activities(p_club_id uuid)
returns table (
  id uuid,
  user_id uuid,
  activity text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select ranked.id, ranked.user_id, ranked.activity, ranked.created_at
  from (
    select
      ua.id,
      ua.user_id,
      ua.activity,
      ua.created_at,
      row_number() over (
        partition by ua.user_id
        order by ua.created_at desc, ua.id desc
      ) as activity_rank
    from public.user_activities ua
    where ua.club_id = p_club_id
      and exists (
        select 1
        from public.user_roles viewer_role
        where viewer_role.club_id = p_club_id
          and viewer_role.user_id = auth.uid()
      )
  ) ranked
  where ranked.activity_rank <= 4
  order by ranked.user_id, ranked.created_at desc;
$$;

revoke all on function public.get_recent_club_member_activities(uuid) from public;
grant execute on function public.get_recent_club_member_activities(uuid) to authenticated;
