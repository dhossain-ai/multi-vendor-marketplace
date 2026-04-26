create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text null,
  role public.user_role not null default 'customer',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.seller_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  store_name text not null,
  slug text null unique,
  status public.seller_status not null default 'pending',
  bio text null,
  logo_url text null,
  commission_rate_bps integer null,
  approved_at timestamptz null,
  approved_by uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint seller_profiles_commission_rate_bps_valid
    check (commission_rate_bps is null or commission_rate_bps between 0 and 10000)
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_is_active_idx on public.profiles (is_active);
create index if not exists seller_profiles_status_idx on public.seller_profiles (status);
create index if not exists seller_profiles_created_at_idx on public.seller_profiles (created_at desc);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists seller_profiles_set_updated_at on public.seller_profiles;
create trigger seller_profiles_set_updated_at
before update on public.seller_profiles
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    role,
    is_active
  )
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    'customer',
    true
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        updated_at = timezone('utc', now());

  return new;
end;
$$;

create or replace function public.handle_updated_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set email = coalesce(new.email, public.profiles.email),
      full_name = case
        when new.raw_user_meta_data ? 'full_name'
          then nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '')
        else public.profiles.full_name
      end,
      updated_at = timezone('utc', now())
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
after update of email, raw_user_meta_data on auth.users
for each row
when (
  old.email is distinct from new.email
  or old.raw_user_meta_data is distinct from new.raw_user_meta_data
)
execute function public.handle_updated_auth_user();

insert into public.profiles (
  id,
  email,
  full_name,
  role,
  is_active,
  created_at,
  updated_at
)
select
  users.id,
  coalesce(users.email, ''),
  nullif(trim(coalesce(users.raw_user_meta_data ->> 'full_name', '')), ''),
  'customer'::public.user_role,
  true,
  coalesce(users.created_at, timezone('utc', now())),
  coalesce(users.updated_at, timezone('utc', now()))
from auth.users as users
on conflict (id) do update
set email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    updated_at = timezone('utc', now());

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select profiles.role
  from public.profiles as profiles
  where profiles.id = auth.uid()
$$;

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false)
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin_user()
$$;

create or replace function public.current_seller_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select seller_profiles.id
  from public.seller_profiles
  where seller_profiles.user_id = auth.uid()
  order by seller_profiles.created_at asc
  limit 1
$$;

create or replace function public.current_user_can_manage_seller_profile(target_seller_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    public.is_admin_user()
    or exists (
      select 1
      from public.seller_profiles
      join public.profiles
        on public.profiles.id = public.seller_profiles.user_id
      where public.seller_profiles.id = target_seller_profile_id
        and public.seller_profiles.user_id = auth.uid()
        and public.profiles.role = 'seller'
        and public.seller_profiles.status = 'approved'
    ),
    false
  )
$$;

grant usage on schema public to anon, authenticated, service_role;

grant all on public.profiles to service_role;
grant select, insert, update on public.profiles to authenticated;

grant all on public.seller_profiles to service_role;
grant select on public.seller_profiles to anon;
grant select, insert, update on public.seller_profiles to authenticated;

alter table public.profiles enable row level security;
alter table public.seller_profiles enable row level security;

drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin
on public.profiles
for select
to authenticated
using (auth.uid() = id or public.is_admin_user());

drop policy if exists profiles_insert_own_or_admin on public.profiles;
create policy profiles_insert_own_or_admin
on public.profiles
for insert
to authenticated
with check (auth.uid() = id or public.is_admin_user());

drop policy if exists profiles_update_own_or_admin on public.profiles;
create policy profiles_update_own_or_admin
on public.profiles
for update
to authenticated
using (auth.uid() = id or public.is_admin_user())
with check (auth.uid() = id or public.is_admin_user());

drop policy if exists seller_profiles_select_public_approved on public.seller_profiles;
create policy seller_profiles_select_public_approved
on public.seller_profiles
for select
to anon, authenticated
using (status = 'approved');

drop policy if exists seller_profiles_select_own_or_admin on public.seller_profiles;
create policy seller_profiles_select_own_or_admin
on public.seller_profiles
for select
to authenticated
using (user_id = auth.uid() or public.is_admin_user());

drop policy if exists seller_profiles_insert_self_pending_or_admin on public.seller_profiles;
create policy seller_profiles_insert_self_pending_or_admin
on public.seller_profiles
for insert
to authenticated
with check (
  public.is_admin_user()
  or (
    user_id = auth.uid()
    and status = 'pending'
    and approved_at is null
    and approved_by is null
  )
);

drop policy if exists seller_profiles_update_admin_only on public.seller_profiles;
create policy seller_profiles_update_admin_only
on public.seller_profiles
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());
