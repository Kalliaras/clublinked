-- Avoid a PL/pgSQL variable/column name collision in the admin dashboard RPC.

create or replace function public.get_admin_dashboard(p_club_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_application_id uuid;
  application_title text;
  total_applications bigint := 0;
  pending_applications bigint := 0;
  interview_applications bigint := 0;
  accepted_applications bigint := 0;
  rejected_applications bigint := 0;
  scheduled_interviews bigint := 0;
  club_members bigint := 0;
  result jsonb;
begin
  if current_user_id is null or not exists (
    select 1
    from public.user_roles ur
    where ur.user_id = current_user_id
      and ur.club_id = p_club_id
      and (ur.is_owner or ur.is_admin)
  ) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  select ca.id, ca.title
  into target_application_id, application_title
  from public.club_applications ca
  where ca.club_id = p_club_id
  order by ca.is_active desc, ca.updated_at desc
  limit 1;

  if target_application_id is not null then
    select
      count(*),
      count(*) filter (where s.status = 'pending'),
      count(*) filter (where s.status = 'interview'),
      count(*) filter (where s.status = 'accepted'),
      count(*) filter (where s.status = 'rejected')
    into
      total_applications,
      pending_applications,
      interview_applications,
      accepted_applications,
      rejected_applications
    from public.application_submissions s
    where s.application_id = target_application_id;

    select count(*)
    into scheduled_interviews
    from public.application_interviews ai
    join public.application_submissions s on s.id = ai.submission_id
    where s.application_id = target_application_id
      and s.status = 'interview'
      and ai.interview_time >= now();
  end if;

  select count(*)
  into club_members
  from public.user_roles ur
  where ur.club_id = p_club_id;

  select jsonb_build_object(
    'club', jsonb_build_object(
      'id', c.id,
      'name', c.name,
      'club_image', c.club_image
    ),
    'application_title', application_title,
    'admin_clubs', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'club_id', managed_club.id,
          'name', managed_club.name,
          'club_image', managed_club.club_image
        ) order by managed_club.name
      )
      from public.user_roles managed_role
      join public.clubs managed_club on managed_club.id = managed_role.club_id
      where managed_role.user_id = current_user_id
        and (managed_role.is_owner or managed_role.is_admin)
    ), '[]'::jsonb),
    'metrics', jsonb_build_object(
      'totalApplications', total_applications,
      'pendingReview', pending_applications,
      'interviewsScheduled', scheduled_interviews,
      'memberCount', club_members
    ),
    'pipeline_counts', jsonb_build_object(
      'pending', pending_applications,
      'interview', interview_applications,
      'accepted', accepted_applications,
      'rejected', rejected_applications
    ),
    'recent_submissions', case
      when target_application_id is null then '[]'::jsonb
      else coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'id', recent.id,
            'submitted_at', recent.submitted_at,
            'status', recent.status,
            'student', jsonb_build_object(
              'first_name', recent.first_name,
              'last_name', recent.last_name,
              'major', recent.major,
              'academic_year', recent.academic_year
            )
          ) order by recent.submitted_at desc
        )
        from (
          select
            s.id,
            s.submitted_at,
            s.status,
            p.first_name,
            p.last_name,
            p.major,
            p.academic_year
          from public.application_submissions s
          join public.profiles p on p.id = s.student_id
          where s.application_id = target_application_id
          order by s.submitted_at desc
          limit 5
        ) recent
      ), '[]'::jsonb)
    end,
    'upcoming_interviews', case
      when target_application_id is null then '[]'::jsonb
      else coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'id', upcoming.id,
            'interview_time', upcoming.interview_time,
            'interview_round', upcoming.interview_round,
            'student', jsonb_build_object(
              'first_name', upcoming.first_name,
              'last_name', upcoming.last_name
            )
          ) order by upcoming.interview_time
        )
        from (
          select
            ai.id,
            ai.interview_time,
            ai.interview_round,
            p.first_name,
            p.last_name
          from public.application_interviews ai
          join public.application_submissions s on s.id = ai.submission_id
          join public.profiles p on p.id = s.student_id
          where s.application_id = target_application_id
            and s.status = 'interview'
            and ai.interview_time >= now()
          order by ai.interview_time
          limit 4
        ) upcoming
      ), '[]'::jsonb)
    end,
    'user_profile', (
      select jsonb_build_object(
        'first_name', p.first_name,
        'last_name', p.last_name
      )
      from public.profiles p
      where p.id = current_user_id
    )
  )
  into result
  from public.clubs c
  where c.id = p_club_id;

  if result is null then
    raise exception 'Club not found' using errcode = 'P0002';
  end if;

  return result;
end;
$$;

revoke all on function public.get_admin_dashboard(uuid) from public;
grant execute on function public.get_admin_dashboard(uuid) to authenticated;
