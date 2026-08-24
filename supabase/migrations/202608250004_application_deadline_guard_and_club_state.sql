-- Keep application closing checks inside the same transaction that creates a
-- submission, and collapse club-page viewer state into one database round trip.

create or replace function public.create_application_submission_if_open(
  p_application_id uuid,
  p_club_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  student_id uuid := (select auth.uid());
  application_is_active boolean;
  deadline timestamptz;
  submission_id uuid;
begin
  if student_id is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  select application.is_active, club.application_deadline
  into application_is_active, deadline
  from public.club_applications as application
  join public.clubs as club on club.id = application.club_id
  where application.id = p_application_id
    and application.club_id = p_club_id
  for update of application;

  if not found then
    raise exception 'APPLICATION_NOT_FOUND' using errcode = 'P0002';
  end if;

  if not application_is_active
    or (deadline is not null and deadline <= now())
  then
    raise exception 'APPLICATION_CLOSED' using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from public.application_submissions as existing
    where existing.application_id = p_application_id
      and existing.student_id = student_id
  ) then
    raise exception 'ALREADY_SUBMITTED' using errcode = '23505';
  end if;

  insert into public.application_submissions (
    application_id,
    student_id,
    status
  )
  values (
    p_application_id,
    student_id,
    'pending'
  )
  returning id into submission_id;

  return submission_id;
end;
$$;

revoke all on function public.create_application_submission_if_open(uuid, uuid)
  from public;
grant execute on function public.create_application_submission_if_open(uuid, uuid)
  to authenticated;

create or replace function public.get_club_viewer_state(p_club_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with viewer as (
    select auth.uid() as user_id
  ),
  membership as (
    select role.is_owner, role.is_admin
    from public.user_roles as role
    cross join viewer
    where role.club_id = p_club_id
      and role.user_id = viewer.user_id
    limit 1
  )
  select jsonb_build_object(
    'is_member', exists (select 1 from membership),
    'is_owner', coalesce((select is_owner from membership), false),
    'is_admin', coalesce(
      (select is_admin or is_owner from membership),
      false
    ),
    'has_applied', exists (
      select 1
      from public.application_submissions as submission
      join public.club_applications as application
        on application.id = submission.application_id
      cross join viewer
      where application.club_id = p_club_id
        and application.is_active = true
        and submission.student_id = viewer.user_id
    )
  );
$$;

revoke all on function public.get_club_viewer_state(uuid) from public;
grant execute on function public.get_club_viewer_state(uuid) to anon, authenticated;
