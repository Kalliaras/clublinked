-- Owners may manage other members, but cannot change their own role.

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

  if p_user_id = auth.uid() then
    raise exception 'Owners cannot change their own role' using errcode = '42501';
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
