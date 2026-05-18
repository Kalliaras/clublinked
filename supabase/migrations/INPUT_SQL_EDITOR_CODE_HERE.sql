-- ══════════════════════════════════════════════════════════════════════════════
-- RLS Policies for club_applications and application_submissions
-- ══════════════════════════════════════════════════════════════════════════════

-- ── club_applications: allow authenticated users to read (needed to apply) ──
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'club_applications'
      and policyname = 'Authenticated users can read club applications'
  ) then
    create policy "Authenticated users can read club applications"
      on public.club_applications for select
      to authenticated
      using (true);
  end if;
end $$;

-- ── club_applications: club owners/admins can manage ────────────────────────
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'club_applications'
      and policyname = 'Club owners can manage their applications'
  ) then
    create policy "Club owners can manage their applications"
      on public.club_applications for all
      to authenticated
      using (
        exists (
          select 1 from public.user_roles
          where user_roles.club_id = club_applications.club_id
            and user_roles.user_id = auth.uid()
            and (user_roles.is_owner = true or user_roles.is_admin = true)
        )
      )
      with check (
        exists (
          select 1 from public.user_roles
          where user_roles.club_id = club_applications.club_id
            and user_roles.user_id = auth.uid()
            and (user_roles.is_owner = true or user_roles.is_admin = true)
        )
      );
  end if;
end $$;

-- ── application_submissions: students can read their own ─────────────────────
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'application_submissions'
      and policyname = 'Students can read their own submissions'
  ) then
    create policy "Students can read their own submissions"
      on public.application_submissions for select
      to authenticated
      using (student_id = auth.uid());
  end if;
end $$;

-- ── application_submissions: club admins can read all for their club ─────────
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'application_submissions'
      and policyname = 'Club admins can read submissions for their applications'
  ) then
    create policy "Club admins can read submissions for their applications"
      on public.application_submissions for select
      to authenticated
      using (
        exists (
          select 1 from public.club_applications ca
          join public.user_roles ur on ur.club_id = ca.club_id
          where ca.id = application_submissions.application_id
            and ur.user_id = auth.uid()
            and (ur.is_owner = true or ur.is_admin = true)
        )
      );
  end if;
end $$;

-- ── application_submissions: students can submit ─────────────────────────────
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'application_submissions'
      and policyname = 'Students can submit applications'
  ) then
    create policy "Students can submit applications"
      on public.application_submissions for insert
      to authenticated
      with check (student_id = auth.uid());
  end if;
end $$;

-- ── application_submissions: club admins can update status ───────────────────
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'application_submissions'
      and policyname = 'Club admins can update submission status'
  ) then
    create policy "Club admins can update submission status"
      on public.application_submissions for update
      to authenticated
      using (
        exists (
          select 1 from public.club_applications ca
          join public.user_roles ur on ur.club_id = ca.club_id
          where ca.id = application_submissions.application_id
            and ur.user_id = auth.uid()
            and (ur.is_owner = true or ur.is_admin = true)
        )
      );
  end if;
end $$;

-- ── application_submissions: students can delete their own pending ────────────
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'application_submissions'
      and policyname = 'Students can delete their own pending submissions'
  ) then
    create policy "Students can delete their own pending submissions"
      on public.application_submissions for delete
      to authenticated
      using (student_id = auth.uid());
  end if;
end $$;
