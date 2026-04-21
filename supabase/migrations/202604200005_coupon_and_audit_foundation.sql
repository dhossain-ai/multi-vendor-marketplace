create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type public.coupon_type not null,
  value_amount numeric(12,2) not null,
  minimum_order_amount numeric(12,2) null,
  usage_limit_total integer null,
  usage_limit_per_user integer null,
  starts_at timestamptz null,
  expires_at timestamptz null,
  is_active boolean not null default true,
  seller_id uuid null references public.seller_profiles(id) on delete set null,
  created_by uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint coupons_value_non_negative check (value_amount >= 0),
  constraint coupons_minimum_non_negative check (
    minimum_order_amount is null or minimum_order_amount >= 0
  ),
  constraint coupons_usage_limit_total_positive check (
    usage_limit_total is null or usage_limit_total > 0
  ),
  constraint coupons_usage_limit_per_user_positive check (
    usage_limit_per_user is null or usage_limit_per_user > 0
  ),
  constraint coupons_date_window_valid check (
    starts_at is null
    or expires_at is null
    or starts_at <= expires_at
  )
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references public.profiles(id) on delete restrict,
  action_type text not null,
  target_table text not null,
  target_id uuid null,
  before_data jsonb null,
  after_data jsonb null,
  reason text null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists coupons_is_active_idx on public.coupons (is_active);
create index if not exists coupons_seller_id_idx on public.coupons (seller_id);
create index if not exists coupons_starts_at_idx on public.coupons (starts_at);
create index if not exists coupons_expires_at_idx on public.coupons (expires_at);

create index if not exists admin_audit_logs_admin_user_id_idx on public.admin_audit_logs (admin_user_id);
create index if not exists admin_audit_logs_target_table_idx on public.admin_audit_logs (target_table);
create index if not exists admin_audit_logs_target_id_idx on public.admin_audit_logs (target_id);
create index if not exists admin_audit_logs_created_at_desc_idx
  on public.admin_audit_logs (created_at desc);

drop trigger if exists coupons_set_updated_at on public.coupons;
create trigger coupons_set_updated_at
before update on public.coupons
for each row
execute function public.set_updated_at();

grant all on public.coupons to service_role;
grant select, insert, update, delete on public.coupons to authenticated;

grant all on public.admin_audit_logs to service_role;
grant select, insert on public.admin_audit_logs to authenticated;

alter table public.coupons enable row level security;
alter table public.admin_audit_logs enable row level security;

drop policy if exists coupons_select_admin_only on public.coupons;
create policy coupons_select_admin_only
on public.coupons
for select
to authenticated
using (public.is_admin_user());

drop policy if exists coupons_write_admin_only on public.coupons;
create policy coupons_write_admin_only
on public.coupons
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists admin_audit_logs_select_admin_only on public.admin_audit_logs;
create policy admin_audit_logs_select_admin_only
on public.admin_audit_logs
for select
to authenticated
using (public.is_admin_user());

drop policy if exists admin_audit_logs_insert_admin_only on public.admin_audit_logs;
create policy admin_audit_logs_insert_admin_only
on public.admin_audit_logs
for insert
to authenticated
with check (
  public.is_admin_user()
  and admin_user_id = auth.uid()
);
