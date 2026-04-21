create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'user_role'
  ) then
    create type public.user_role as enum ('customer', 'seller', 'admin');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'seller_status'
  ) then
    create type public.seller_status as enum ('pending', 'approved', 'rejected', 'suspended');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'product_status'
  ) then
    create type public.product_status as enum ('draft', 'active', 'archived', 'suspended');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'order_status'
  ) then
    create type public.order_status as enum (
      'pending',
      'confirmed',
      'processing',
      'completed',
      'cancelled',
      'refunded',
      'partially_refunded'
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'payment_status'
  ) then
    create type public.payment_status as enum (
      'unpaid',
      'processing',
      'paid',
      'failed',
      'refunded',
      'partially_refunded'
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'coupon_type'
  ) then
    create type public.coupon_type as enum ('fixed', 'percentage');
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;
