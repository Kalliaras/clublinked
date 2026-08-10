-- Fast, authorization-checked application review reads and atomic decisions.

create index if not exists application_submissions_application_status_idx
  on public.application_submissions (application_id, status);

create index if not exists application_answers_submission_idx
  on public.application_answers (submission_id);

create index if not exists application_interviews_submission_time_idx
  on public.application_interviews (submission_id, interview_time desc);

create index if not exists user_roles_club_user_idx
  on public.user_roles (club_id, user_id);

create or replace function public.get_application_review(
  p_submission_id uuid,
  p_club_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if auth.uid() is null or not exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.club_id = p_club_id
      and (ur.is_owner or ur.is_admin)
  ) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'submission', jsonb_build_object(
      'id', s.id,
      'status', s.status,
      'submitted_at', s.submitted_at
    ),
    'club', jsonb_build_object(
      'id', c.id,
      'name', c.name,
      'club_image', c.club_image
    ),
    'application', jsonb_build_object(
      'id', ca.id,
      'title', ca.title,
      'description', ca.description
    ),
    'student', jsonb_build_object(
      'id', p.id,
      'first_name', p.first_name,
      'last_name', p.last_name,
      'email', p.email,
      'major', p.major,
      'academic_year', p.academic_year,
      'resume', p.resume
    ),
    'questions', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', q.id,
          'question_text', q.question_text,
          'question_type', q.question_type,
          'is_required', q.is_required,
          'order', q."order",
          'answer_text', aa.answer_text
        ) order by q."order"
      )
      from public.application_questions q
      left join public.application_answers aa
        on aa.question_id = q.id
       and aa.submission_id = s.id
      where q.application_id = ca.id
    ), '[]'::jsonb),
    'interview', (
      select jsonb_build_object(
        'id', ai.id,
        'interview_time', ai.interview_time,
        'interview_round', ai.interview_round
      )
      from public.application_interviews ai
      where ai.submission_id = s.id
      order by ai.interview_round desc, ai.created_at desc
      limit 1
    )
  )
  into result
  from public.application_submissions s
  join public.club_applications ca on ca.id = s.application_id
  join public.clubs c on c.id = ca.club_id
  join public.profiles p on p.id = s.student_id
  where s.id = p_submission_id
    and ca.club_id = p_club_id;

  return result;
end;
$$;

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

revoke all on function public.get_application_review(uuid, uuid) from public;
revoke all on function public.review_application_submission(uuid, uuid, text, timestamptz) from public;
grant execute on function public.get_application_review(uuid, uuid) to authenticated;
grant execute on function public.review_application_submission(uuid, uuid, text, timestamptz) to authenticated;
