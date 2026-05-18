-- ══════════════════════════════════════════════════════════════════════════════
-- Admin Dashboard DB Changes
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 10. Add 'interview' to application_submissions status check ────────────
do $$ begin
  if exists (
    select 1 from pg_constraint
    where conname = 'application_submissions_status_check'
      and conrelid = 'public.application_submissions'::regclass
  ) then
    alter table public.application_submissions
      drop constraint application_submissions_status_check;
  end if;
end $$;

alter table public.application_submissions
  add constraint application_submissions_status_check
  check (status in ('pending', 'interview', 'accepted', 'rejected'));

-- ── 11. application_interviews table ──────────────────────────────────────
create table if not exists public.application_interviews (
  id              uuid primary key default gen_random_uuid(),
  submission_id   uuid not null references public.application_submissions(id) on delete cascade,
  interview_round integer not null default 1,
  interview_time  timestamptz,
  created_at      timestamptz not null default now()
);

alter table public.application_interviews enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'application_interviews'
      and policyname = 'Authenticated users can manage interviews'
  ) then
    create policy "Authenticated users can manage interviews"
      on public.application_interviews for all
      to authenticated
      using (true)
      with check (true);
  end if;
end $$;

create index if not exists idx_app_interviews_submission_id
  on public.application_interviews(submission_id);

-- ── 12. Add is_admin to user_roles ────────────────────────────────────────
alter table public.user_roles
  add column if not exists is_admin boolean not null default false;

-- ── 13. Populate email_domain from website_url ────────────────────────────
-- Transformation rules:
--   1. Strip http:// or https://
--   2. Strip www. prefix if present
--   3. Strip any trailing path (everything after the first / following the domain)
--   4. Prepend @
-- Examples:
--   http://www.siu.edu/  → @siu.edu
--   https://www.mit.edu  → @mit.edu
--   https://illinois.edu/about → @illinois.edu

update public.universities
set email_domain = '@' || regexp_replace(
    regexp_replace(
        regexp_replace(
            website_url,
            '^https?://',   -- step 1: strip http:// or https://
            ''
        ),
        '^www\.',           -- step 2: strip www. prefix
        ''
    ),
    '/.*$',                 -- step 3: strip trailing slash and path
    ''
)
where website_url is not null;

-- Preview query — uncomment and run first to verify results before the UPDATE:
-- select
--   website_url,
--   '@' || regexp_replace(
--       regexp_replace(
--           regexp_replace(
--               website_url,
--               '^https?://', ''
--           ),
--           '^www\.', ''
--       ),
--       '/.*$', ''
--   ) as computed_email_domain,
--   email_domain as current_email_domain
-- from public.universities
-- where website_url is not null
-- order by website_url
-- limit 50;
