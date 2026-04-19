create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid not null references public.profiles(id) on delete restrict,
  order_status text not null,
  payment_status text not null,
  currency_code text not null,
  subtotal_amount numeric(12,2) not null,
  discount_amount numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null,
  coupon_id uuid null,
  shipping_address_snapshot jsonb null,
  billing_address_snapshot jsonb null,
  placed_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint orders_order_status_valid
    check (order_status in ('pending', 'confirmed', 'processing', 'completed', 'cancelled', 'refunded', 'partially_refunded')),
  constraint orders_payment_status_valid
    check (payment_status in ('unpaid', 'processing', 'paid', 'failed', 'refunded', 'partially_refunded')),
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
  status text not null,
  amount numeric(12,2) not null,
  currency_code text not null,
  idempotency_key text null,
  raw_provider_payload jsonb null,
  paid_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint payments_status_valid
    check (status in ('unpaid', 'processing', 'paid', 'failed', 'refunded', 'partially_refunded')),
  constraint payments_amount_non_negative check (amount >= 0)
);

create index if not exists orders_customer_id_idx on public.orders (customer_id);
create index if not exists orders_order_status_idx on public.orders (order_status);
create index if not exists orders_payment_status_idx on public.orders (payment_status);
create index if not exists orders_created_at_desc_idx on public.orders (created_at desc);
create index if not exists orders_customer_created_at_desc_idx on public.orders (customer_id, created_at desc);

create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_seller_id_idx on public.order_items (seller_id);
create index if not exists order_items_product_id_idx on public.order_items (product_id);
create index if not exists order_items_seller_created_at_desc_idx on public.order_items (seller_id, created_at desc);

create index if not exists payments_order_id_idx on public.payments (order_id);
create index if not exists payments_status_idx on public.payments (status);
create unique index if not exists payments_provider_payment_id_uidx on public.payments (provider_payment_id) where provider_payment_id is not null;
create unique index if not exists payments_provider_session_id_uidx on public.payments (provider_session_id) where provider_session_id is not null;
create unique index if not exists payments_idempotency_key_uidx on public.payments (idempotency_key) where idempotency_key is not null;

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
