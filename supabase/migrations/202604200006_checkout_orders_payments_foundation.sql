create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid not null references public.profiles(id) on delete restrict,
  order_status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'unpaid',
  currency_code text not null,
  subtotal_amount numeric(12,2) not null,
  discount_amount numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null,
  coupon_id uuid null references public.coupons(id) on delete set null,
  shipping_address_snapshot jsonb null,
  billing_address_snapshot jsonb null,
  placed_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint orders_subtotal_non_negative check (subtotal_amount >= 0),
  constraint orders_discount_non_negative check (discount_amount >= 0),
  constraint orders_tax_non_negative check (tax_amount >= 0),
  constraint orders_total_non_negative check (total_amount >= 0)
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid null references public.products(id) on delete set null,
  seller_id uuid not null references public.seller_profiles(id) on delete restrict,
  product_title_snapshot text not null,
  product_slug_snapshot text null,
  unit_price_amount numeric(12,2) not null,
  quantity integer not null,
  line_subtotal_amount numeric(12,2) not null,
  discount_amount numeric(12,2) not null default 0,
  line_total_amount numeric(12,2) not null,
  currency_code text not null,
  product_metadata_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint order_items_quantity_positive check (quantity > 0),
  constraint order_items_unit_price_non_negative check (unit_price_amount >= 0),
  constraint order_items_line_subtotal_non_negative check (line_subtotal_amount >= 0),
  constraint order_items_discount_non_negative check (discount_amount >= 0),
  constraint order_items_line_total_non_negative check (line_total_amount >= 0)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null,
  provider_payment_id text null,
  provider_session_id text null,
  status public.payment_status not null,
  amount numeric(12,2) not null,
  currency_code text not null,
  idempotency_key text null,
  raw_provider_payload jsonb null,
  paid_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint payments_amount_non_negative check (amount >= 0)
);

create index if not exists orders_customer_id_idx on public.orders (customer_id);
create index if not exists orders_order_status_idx on public.orders (order_status);
create index if not exists orders_payment_status_idx on public.orders (payment_status);
create index if not exists orders_created_at_desc_idx on public.orders (created_at desc);
create index if not exists orders_customer_created_at_desc_idx
  on public.orders (customer_id, created_at desc);
create index if not exists orders_order_status_payment_status_created_at_idx
  on public.orders (order_status, payment_status, created_at desc);

create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_seller_id_idx on public.order_items (seller_id);
create index if not exists order_items_product_id_idx on public.order_items (product_id);
create index if not exists order_items_seller_created_at_desc_idx
  on public.order_items (seller_id, created_at desc);
create index if not exists order_items_order_seller_idx
  on public.order_items (order_id, seller_id);

create index if not exists payments_order_id_idx on public.payments (order_id);
create index if not exists payments_status_idx on public.payments (status);
create unique index if not exists payments_provider_payment_id_uidx
  on public.payments (provider_payment_id)
  where provider_payment_id is not null;
create unique index if not exists payments_provider_session_id_uidx
  on public.payments (provider_session_id)
  where provider_session_id is not null;
create unique index if not exists payments_idempotency_key_uidx
  on public.payments (idempotency_key)
  where idempotency_key is not null;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at
before update on public.payments
for each row
execute function public.set_updated_at();

create or replace function public.current_user_owns_order(target_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    exists (
      select 1
      from public.orders
      where public.orders.id = target_order_id
        and public.orders.customer_id = auth.uid()
    ),
    false
  )
$$;

create or replace function public.current_user_can_view_order(target_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    public.is_admin_user()
    or public.current_user_owns_order(target_order_id)
    or exists (
      select 1
      from public.order_items
      where public.order_items.order_id = target_order_id
        and public.current_user_can_manage_seller_profile(public.order_items.seller_id)
    ),
    false
  )
$$;

grant all on public.orders to service_role;
grant select, insert on public.orders to authenticated;

grant all on public.order_items to service_role;
grant select, insert on public.order_items to authenticated;

grant all on public.payments to service_role;
grant select, insert, update on public.payments to authenticated;

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;

drop policy if exists orders_select_viewable_or_admin on public.orders;
create policy orders_select_viewable_or_admin
on public.orders
for select
to authenticated
using (public.current_user_can_view_order(id));

drop policy if exists orders_insert_owned_or_admin on public.orders;
create policy orders_insert_owned_or_admin
on public.orders
for insert
to authenticated
with check (customer_id = auth.uid() or public.is_admin_user());

drop policy if exists order_items_select_viewable_or_admin on public.order_items;
create policy order_items_select_viewable_or_admin
on public.order_items
for select
to authenticated
using (public.current_user_can_view_order(order_id));

drop policy if exists order_items_insert_owned_or_admin on public.order_items;
create policy order_items_insert_owned_or_admin
on public.order_items
for insert
to authenticated
with check (public.current_user_owns_order(order_id) or public.is_admin_user());

drop policy if exists payments_select_owned_or_admin on public.payments;
create policy payments_select_owned_or_admin
on public.payments
for select
to authenticated
using (public.current_user_owns_order(order_id) or public.is_admin_user());

drop policy if exists payments_insert_owned_or_admin on public.payments;
create policy payments_insert_owned_or_admin
on public.payments
for insert
to authenticated
with check (public.current_user_owns_order(order_id) or public.is_admin_user());

drop policy if exists payments_update_admin_only on public.payments;
create policy payments_update_admin_only
on public.payments
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());
