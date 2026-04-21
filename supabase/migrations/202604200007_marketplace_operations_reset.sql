do $$
begin
  if not exists (
    select 1
    from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'fulfillment_status'
  ) then
    create type public.fulfillment_status as enum (
      'unfulfilled',
      'processing',
      'shipped',
      'delivered',
      'cancelled'
    );
  end if;
end
$$;

alter table public.carts
  add column if not exists coupon_id uuid null references public.coupons(id) on delete set null;

create index if not exists carts_coupon_id_idx on public.carts (coupon_id);

alter table public.order_items
  add column if not exists fulfillment_status public.fulfillment_status not null default 'unfulfilled',
  add column if not exists tracking_code text null,
  add column if not exists shipment_note text null,
  add column if not exists shipped_at timestamptz null,
  add column if not exists delivered_at timestamptz null,
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.order_items as oi
set fulfillment_status = case
  when o.order_status = 'cancelled' then 'cancelled'::public.fulfillment_status
  when o.order_status = 'completed' then 'delivered'::public.fulfillment_status
  when o.order_status = 'processing' then 'processing'::public.fulfillment_status
  else 'unfulfilled'::public.fulfillment_status
end
from public.orders as o
where o.id = oi.order_id;

create index if not exists order_items_fulfillment_status_idx
  on public.order_items (fulfillment_status);

create index if not exists order_items_seller_fulfillment_updated_at_desc_idx
  on public.order_items (seller_id, fulfillment_status, updated_at desc);

drop trigger if exists order_items_set_updated_at on public.order_items;
create trigger order_items_set_updated_at
before update on public.order_items
for each row
execute function public.set_updated_at();

create or replace function public.sync_order_status_from_fulfillment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_order_id uuid := coalesce(new.order_id, old.order_id);
  current_payment_status public.payment_status;
  current_order_status public.order_status;
  total_item_count integer;
  non_cancelled_item_count integer;
  delivered_item_count integer;
  shipped_or_delivered_item_count integer;
  processing_item_count integer;
  cancelled_item_count integer;
begin
  if target_order_id is null then
    return coalesce(new, old);
  end if;

  select payment_status, order_status
  into current_payment_status, current_order_status
  from public.orders
  where id = target_order_id;

  if current_payment_status is null then
    return coalesce(new, old);
  end if;

  if current_payment_status <> 'paid'
     or current_order_status in ('cancelled', 'refunded', 'partially_refunded') then
    return coalesce(new, old);
  end if;

  select
    count(*),
    count(*) filter (where fulfillment_status <> 'cancelled'),
    count(*) filter (where fulfillment_status = 'delivered'),
    count(*) filter (where fulfillment_status in ('shipped', 'delivered')),
    count(*) filter (where fulfillment_status = 'processing'),
    count(*) filter (where fulfillment_status = 'cancelled')
  into
    total_item_count,
    non_cancelled_item_count,
    delivered_item_count,
    shipped_or_delivered_item_count,
    processing_item_count,
    cancelled_item_count
  from public.order_items
  where order_id = target_order_id;

  update public.orders
  set order_status = case
    when total_item_count > 0 and cancelled_item_count = total_item_count
      then 'cancelled'::public.order_status
    when non_cancelled_item_count > 0 and delivered_item_count = non_cancelled_item_count
      then 'completed'::public.order_status
    when shipped_or_delivered_item_count > 0 or processing_item_count > 0
      then 'processing'::public.order_status
    else 'confirmed'::public.order_status
  end
  where id = target_order_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists order_items_sync_order_status_from_fulfillment on public.order_items;
create trigger order_items_sync_order_status_from_fulfillment
after insert or update or delete on public.order_items
for each row
execute function public.sync_order_status_from_fulfillment();

grant update (
  fulfillment_status,
  tracking_code,
  shipment_note,
  shipped_at,
  delivered_at
) on public.order_items to authenticated;

drop policy if exists order_items_update_seller_fulfillment_or_admin on public.order_items;
create policy order_items_update_seller_fulfillment_or_admin
on public.order_items
for update
to authenticated
using (
  public.is_admin()
  or public.current_user_can_manage_seller_profile(seller_id)
)
with check (
  public.is_admin()
  or public.current_user_can_manage_seller_profile(seller_id)
);
