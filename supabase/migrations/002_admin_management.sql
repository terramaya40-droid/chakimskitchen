-- Chef Chakim's Yummys — Admin Management & Setup Policies

-- Helper function to check if admin table is empty (useful for initial setup)
create or replace function public.is_admin_table_empty()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (select 1 from public.admin_users);
$$;

-- Grant permissions for public read on helper function
grant execute on function public.is_admin_table_empty() to anon, authenticated;

-- Allow authenticated admins full management of admin_users table
drop policy if exists "Admin read admin users" on public.admin_users;
drop policy if exists "Admin manage admin users" on public.admin_users;

create policy "Admin manage admin users"
  on public.admin_users
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Allow inserting into admin_users during initial setup if table is completely empty
drop policy if exists "Initial admin setup insert" on public.admin_users;

create policy "Initial admin setup insert"
  on public.admin_users
  for insert
  with check (public.is_admin_table_empty());

-- Function for a user to claim initial admin status if table is empty
create or replace function public.claim_initial_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin_table_empty() then
    insert into public.admin_users (user_id)
    values (auth.uid());
    return true;
  end if;
  return false;
end;
$$;

grant execute on function public.claim_initial_admin() to authenticated;
