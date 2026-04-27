create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text null,
  recipient_name text not null,
  line_1 text not null,
  line_2 text null,
  city text not null,
  state_region text null,
  postal_code text null,
  country_code text not null,
  phone text null,
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint addresses_country_code_format
    check (country_code = upper(country_code) and char_length(country_code) = 2)
);

create index if not exists addresses_user_id_idx
  on public.addresses (user_id);

create unique index if not exists addresses_one_default_per_user_uidx
  on public.addresses (user_id)
  where is_default = true;

create index if not exists addresses_user_default_idx
  on public.addresses (user_id)
  where is_default = true;

drop trigger if exists addresses_set_updated_at on public.addresses;
create trigger addresses_set_updated_at
before update on public.addresses
for each row
execute function public.set_updated_at();

grant all on public.addresses to service_role;
grant select, insert, update, delete on public.addresses to authenticated;

alter table public.addresses enable row level security;

drop policy if exists addresses_select_owned_or_admin on public.addresses;
create policy addresses_select_owned_or_admin
on public.addresses
for select
to authenticated
using (user_id = auth.uid() or public.is_admin_user());

drop policy if exists addresses_insert_owned_or_admin on public.addresses;
create policy addresses_insert_owned_or_admin
on public.addresses
for insert
to authenticated
with check (user_id = auth.uid() or public.is_admin_user());

drop policy if exists addresses_update_owned_or_admin on public.addresses;
create policy addresses_update_owned_or_admin
on public.addresses
for update
to authenticated
using (user_id = auth.uid() or public.is_admin_user())
with check (user_id = auth.uid() or public.is_admin_user());

drop policy if exists addresses_delete_owned_or_admin on public.addresses;
create policy addresses_delete_owned_or_admin
on public.addresses
for delete
to authenticated
using (user_id = auth.uid() or public.is_admin_user());
