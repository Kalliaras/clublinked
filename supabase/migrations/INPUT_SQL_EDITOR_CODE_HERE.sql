-- ── 1. club_applications ──────────────────────────────────────────────────
create table if not exists public.club_applications (
  id          uuid primary key default gen_random_uuid(),
  club_id     uuid not null references public.clubs(id) on delete cascade,
  title       text not null,
  description text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── 2. application_questions ──────────────────────────────────────────────
create table if not exists public.application_questions (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.club_applications(id) on delete cascade,
  question_text  text not null,
  question_type  text not null check (question_type in ('text', 'textarea', 'multiple_choice')),
  is_required    boolean not null default true,
  "order"        integer not null default 0,
  options        jsonb
);

-- ── 3. application_submissions ────────────────────────────────────────────
create table if not exists public.application_submissions (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.club_applications(id) on delete cascade,
  student_id     uuid not null references public.profiles(id) on delete cascade,
  submitted_at   timestamptz not null default now(),
  status         text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  unique (application_id, student_id)
);

-- ── 4. application_answers ────────────────────────────────────────────────
create table if not exists public.application_answers (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.application_submissions(id) on delete cascade,
  question_id   uuid not null references public.application_questions(id) on delete cascade,
  answer_text   text
);

-- ── 5. Add resume column to profiles ─────────────────────────────────────
alter table public.profiles
  add column if not exists resume text;

-- ── 6. RLS ────────────────────────────────────────────────────────────────
alter table public.club_applications      enable row level security;
alter table public.application_questions  enable row level security;
alter table public.application_submissions enable row level security;
alter table public.application_answers    enable row level security;

-- club_applications: authenticated users can read active ones
create policy "Authenticated users can read active applications"
  on public.club_applications for select
  to authenticated
  using (is_active = true);

-- application_questions: authenticated users can read questions for active apps
create policy "Authenticated users can read questions for active applications"
  on public.application_questions for select
  to authenticated
  using (
    exists (
      select 1 from public.club_applications ca
      where ca.id = application_id and ca.is_active = true
    )
  );

-- application_submissions: students can insert and read their own
create policy "Students can insert own submissions"
  on public.application_submissions for insert
  to authenticated
  with check (student_id = auth.uid());

create policy "Students can read own submissions"
  on public.application_submissions for select
  to authenticated
  using (student_id = auth.uid());

-- application_answers: students can insert and read answers for their own submissions
create policy "Students can insert answers for own submissions"
  on public.application_answers for insert
  to authenticated
  with check (
    exists (
      select 1 from public.application_submissions s
      where s.id = submission_id and s.student_id = auth.uid()
    )
  );

create policy "Students can read answers for own submissions"
  on public.application_answers for select
  to authenticated
  using (
    exists (
      select 1 from public.application_submissions s
      where s.id = submission_id and s.student_id = auth.uid()
    )
  );

-- ── 7. Indexes on foreign keys (PostgreSQL does not auto-index FKs) ────────
create index if not exists idx_app_questions_application_id   on public.application_questions(application_id);
create index if not exists idx_app_submissions_application_id on public.application_submissions(application_id);
create index if not exists idx_app_submissions_student_id     on public.application_submissions(student_id);
create index if not exists idx_app_answers_submission_id      on public.application_answers(submission_id);
create index if not exists idx_app_answers_question_id        on public.application_answers(question_id);

-- ── 8. updated_at auto-update trigger for club_applications ─────────────────
create extension if not exists moddatetime schema extensions;

drop trigger if exists handle_updated_at on public.club_applications;
create trigger handle_updated_at
  before update on public.club_applications
  for each row execute procedure extensions.moddatetime(updated_at);

-- ── 9. Seed test data for clubs with uses_applications = true ─────────────
do $$
declare
  r record;
  app_id uuid;
begin
  for r in
    select id from public.clubs where uses_applications = true
  loop
    if exists (
      select 1 from public.club_applications
      where club_id = r.id and is_active = true
    ) then
      continue;
    end if;

    insert into public.club_applications (club_id, title, description, is_active)
    values (
      r.id,
      'General Membership Application',
      'Thank you for your interest in joining! Please fill out this form so we can learn more about you.',
      true
    )
    returning id into app_id;

    insert into public.application_questions
      (application_id, question_text, question_type, is_required, "order", options)
    values
      (app_id, 'How did you hear about us?', 'multiple_choice', true, 1,
       '["From a friend or current member", "Campus event or flyer", "ClubLinked", "Social media", "Other"]'::jsonb),
      (app_id, 'Why do you want to join this club?', 'textarea', true, 2, null),
      (app_id, 'Tell us about a project or experience you are proud of.', 'textarea', true, 3, null),
      (app_id, 'Is there anything else you would like us to know about you?', 'textarea', false, 4, null);
  end loop;
end;
$$;
