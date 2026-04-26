begin;

-- Phase 3 seller recovery foundation.
-- Keep this migration focused on schema/type foundations only; application
-- flows, UI, and business logic are handled in later phases.

alter table public.seller_profiles
  add column if not exists support_email text null,
  add column if not exists business_email text null,
  add column if not exists phone text null,
  add column if not exists country_code text null,
  add column if not exists agreement_accepted_at timestamptz null,
  add column if not exists rejection_reason text null,
  add column if not exists suspension_reason text null,
  add column if not exists resubmitted_at timestamptz null,
  add column if not exists approved_at timestamptz null,
  add column if not exists approved_by uuid null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.seller_profiles'::regclass
      and conname = 'seller_profiles_approved_by_fkey'
  ) then
    alter table public.seller_profiles
      add constraint seller_profiles_approved_by_fkey
      foreign key (approved_by)
      references public.profiles(id)
      on delete set null;
  end if;
end
$$;

create index if not exists seller_profiles_country_code_idx
  on public.seller_profiles (country_code)
  where country_code is not null;

create index if not exists seller_profiles_support_email_idx
  on public.seller_profiles (support_email)
  where support_email is not null;

create index if not exists seller_profiles_resubmitted_at_desc_idx
  on public.seller_profiles (resubmitted_at desc)
  where resubmitted_at is not null;

create table if not exists public.seller_status_history (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.seller_profiles(id) on delete cascade,
  previous_status public.seller_status null,
  new_status public.seller_status not null,
  changed_by uuid null references public.profiles(id) on delete set null,
  reason text null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists seller_status_history_seller_id_idx
  on public.seller_status_history (seller_id);

create index if not exists seller_status_history_changed_by_idx
  on public.seller_status_history (changed_by)
  where changed_by is not null;

create index if not exists seller_status_history_created_at_desc_idx
  on public.seller_status_history (created_at desc);

grant all on public.seller_status_history to service_role;
grant select, insert on public.seller_status_history to authenticated;

alter table public.seller_status_history enable row level security;

drop policy if exists seller_status_history_select_admin on public.seller_status_history;
create policy seller_status_history_select_admin
on public.seller_status_history
for select
to authenticated
using (public.is_admin_user());

drop policy if exists seller_status_history_insert_admin on public.seller_status_history;
create policy seller_status_history_insert_admin
on public.seller_status_history
for insert
to authenticated
with check (
  public.is_admin_user()
  and (
    changed_by is null
    or changed_by = auth.uid()
  )
);

alter table public.products
  add column if not exists low_stock_threshold integer not null default 5;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.products'::regclass
      and conname = 'products_low_stock_threshold_non_negative'
  ) then
    alter table public.products
      add constraint products_low_stock_threshold_non_negative
      check (low_stock_threshold >= 0);
  end if;
end
$$;

create index if not exists products_seller_low_stock_idx
  on public.products (seller_id, stock_quantity)
  where is_unlimited_stock = false
    and status in ('draft', 'active');

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin_user()
$$;

commit;
