-- Add editable social links to user profiles and private, owner-scoped PDF
-- resume storage. Resume object paths are stored in profiles.resume.

alter table public.profiles
  add column if not exists linkedin_url text,
  add column if not exists github_url text,
  add column if not exists instagram_url text,
  add column if not exists x_url text,
  add column if not exists portfolio_url text,
  add column if not exists resume text;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'users_resumes',
  'users_resumes',
  false,
  10485760,
  array['application/pdf']
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can read their own resume" on storage.objects;
drop policy if exists "Users can upload their own resume" on storage.objects;
drop policy if exists "Users can replace their own resume" on storage.objects;
drop policy if exists "Users can delete their own resume" on storage.objects;

create policy "Users can read their own resume"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'users_resumes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can upload their own resume"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'users_resumes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can replace their own resume"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'users_resumes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'users_resumes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can delete their own resume"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'users_resumes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create or replace function public.update_own_user_profile(
  p_first_name text,
  p_last_name text,
  p_major text,
  p_academic_year text,
  p_bio text,
  p_linkedin_url text,
  p_github_url text,
  p_instagram_url text,
  p_x_url text,
  p_portfolio_url text,
  p_resume text,
  p_interest_ids uuid[],
  p_skill_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null then
    raise exception 'You must be signed in'
      using errcode = '42501';
  end if;

  if char_length(btrim(coalesce(p_first_name, ''))) not between 1 and 80
    or char_length(btrim(coalesce(p_last_name, ''))) not between 1 and 80
  then
    raise exception 'First and last name are required and must be 80 characters or fewer'
      using errcode = '22023';
  end if;

  if char_length(coalesce(p_major, '')) > 120
    or char_length(coalesce(p_academic_year, '')) > 40
    or char_length(coalesce(p_bio, '')) > 4000
  then
    raise exception 'One or more profile fields are too long'
      using errcode = '22023';
  end if;

  if coalesce(array_length(p_interest_ids, 1), 0) > 30
    or coalesce(array_length(p_skill_ids, 1), 0) > 30
  then
    raise exception 'Choose no more than 30 interests and 30 skills'
      using errcode = '22023';
  end if;

  if p_resume is not null and not exists (
    select 1
    from storage.objects as resume_object
    where resume_object.bucket_id = 'users_resumes'
      and resume_object.name = p_resume
      and (storage.foldername(resume_object.name))[1] = current_user_id::text
  ) then
    raise exception 'Resume PDF was not found in your storage folder'
      using errcode = '22023';
  end if;

  update public.profiles
  set
    first_name = btrim(p_first_name),
    last_name = btrim(p_last_name),
    major = nullif(btrim(p_major), ''),
    academic_year = nullif(btrim(p_academic_year), ''),
    bio = nullif(btrim(p_bio), ''),
    linkedin_url = nullif(btrim(p_linkedin_url), ''),
    github_url = nullif(btrim(p_github_url), ''),
    instagram_url = nullif(btrim(p_instagram_url), ''),
    x_url = nullif(btrim(p_x_url), ''),
    portfolio_url = nullif(btrim(p_portfolio_url), ''),
    resume = p_resume,
    updated_at = now()
  where id = current_user_id;

  if not found then
    raise exception 'Profile not found'
      using errcode = 'P0002';
  end if;

  delete from public.user_interests where user_id = current_user_id;
  insert into public.user_interests (user_id, interest_id)
  select current_user_id, selected.id
  from public.interest_tags as selected
  where selected.id = any(coalesce(p_interest_ids, array[]::uuid[]));

  delete from public.user_skills where user_id = current_user_id;
  insert into public.user_skills (user_id, skill_id)
  select current_user_id, selected.id
  from public.skill_tags as selected
  where selected.id = any(coalesce(p_skill_ids, array[]::uuid[]));
end;
$$;

revoke all on function public.update_own_user_profile(
  text, text, text, text, text, text, text, text, text, text, text, uuid[], uuid[]
) from public;
grant execute on function public.update_own_user_profile(
  text, text, text, text, text, text, text, text, text, text, text, uuid[], uuid[]
) to authenticated;
