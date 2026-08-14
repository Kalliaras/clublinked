-- Record interview creation as an activity performed by the reviewing admin.

create or replace function public.review_application_submission(
  p_submission_id uuid,
  p_club_id uuid,
  p_status text,
  p_interview_time timestamptz default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_submission public.application_submissions%rowtype;
  latest_interview_id uuid;
  applicant_name text;
begin
  if p_status not in ('pending', 'interview', 'accepted', 'rejected') then
    raise exception 'Invalid application status' using errcode = '22023';
  end if;

  if auth.uid() is null or not exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.club_id = p_club_id
      and (ur.is_owner or ur.is_admin)
  ) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  select s.*
  into target_submission
  from public.application_submissions s
  join public.club_applications ca on ca.id = s.application_id
  where s.id = p_submission_id
    and ca.club_id = p_club_id
  for update of s;

  if not found then
    raise exception 'Submission not found' using errcode = 'P0002';
  end if;

  update public.application_submissions
  set status = p_status
  where id = target_submission.id;

  if p_status = 'accepted' then
    if not exists (
      select 1 from public.user_roles
      where user_id = target_submission.student_id
        and club_id = p_club_id
    ) then
      insert into public.user_roles (
        user_id, club_id, title, is_owner, is_admin
      ) values (
        target_submission.student_id, p_club_id, 'Member', false, false
      );
    end if;
  elsif p_status = 'rejected' and target_submission.status = 'accepted' then
    delete from public.user_roles
    where user_id = target_submission.student_id
      and club_id = p_club_id
      and not is_owner
      and not is_admin;
  end if;

  if p_status = 'interview' and p_interview_time is not null then
    select id
    into latest_interview_id
    from public.application_interviews
    where submission_id = target_submission.id
    order by interview_round desc, created_at desc
    limit 1;

    if latest_interview_id is null then
      insert into public.application_interviews (
        submission_id, interview_round, interview_time
      ) values (
        target_submission.id, 1, p_interview_time
      );

      select coalesce(
        nullif(btrim(concat_ws(' ', first_name, last_name)), ''),
        'an applicant'
      )
      into applicant_name
      from public.profiles
      where id = target_submission.student_id;

      insert into public.user_activities (user_id, club_id, activity)
      values (
        auth.uid(),
        p_club_id,
        format('Scheduled an interview with %s', coalesce(applicant_name, 'an applicant'))
      );
    else
      update public.application_interviews
      set interview_time = p_interview_time
      where id = latest_interview_id;
    end if;
  elsif p_status in ('accepted', 'rejected') then
    delete from public.application_interviews
    where submission_id = target_submission.id
      and (interview_time is null or interview_time > now());
  end if;
end;
$$;

revoke all on function public.review_application_submission(uuid, uuid, text, timestamptz) from public;
grant execute on function public.review_application_submission(uuid, uuid, text, timestamptz) to authenticated;
