create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint cart_items_quantity_positive check (quantity > 0),
  constraint cart_items_cart_product_unique unique (cart_id, product_id)
);

create index if not exists carts_user_id_idx on public.carts (user_id);
create index if not exists cart_items_cart_id_idx on public.cart_items (cart_id);
create index if not exists cart_items_product_id_idx on public.cart_items (product_id);

drop trigger if exists carts_set_updated_at on public.carts;
create trigger carts_set_updated_at
before update on public.carts
for each row
execute function public.set_updated_at();

drop trigger if exists cart_items_set_updated_at on public.cart_items;
create trigger cart_items_set_updated_at
before update on public.cart_items
for each row
execute function public.set_updated_at();

create or replace function public.current_user_owns_cart(target_cart_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    exists (
      select 1
      from public.carts
      where public.carts.id = target_cart_id
        and public.carts.user_id = auth.uid()
    ),
    false
  )
$$;

grant all on public.carts to service_role;
grant select, insert, update, delete on public.carts to authenticated;

grant all on public.cart_items to service_role;
grant select, insert, update, delete on public.cart_items to authenticated;

alter table public.carts enable row level security;
alter table public.cart_items enable row level security;

drop policy if exists carts_select_owned_or_admin on public.carts;
create policy carts_select_owned_or_admin
on public.carts
for select
to authenticated
using (user_id = auth.uid() or public.is_admin_user());

drop policy if exists carts_insert_owned_or_admin on public.carts;
create policy carts_insert_owned_or_admin
on public.carts
for insert
to authenticated
with check (user_id = auth.uid() or public.is_admin_user());

drop policy if exists carts_update_owned_or_admin on public.carts;
create policy carts_update_owned_or_admin
on public.carts
for update
to authenticated
using (user_id = auth.uid() or public.is_admin_user())
with check (user_id = auth.uid() or public.is_admin_user());

drop policy if exists carts_delete_owned_or_admin on public.carts;
create policy carts_delete_owned_or_admin
on public.carts
for delete
to authenticated
using (user_id = auth.uid() or public.is_admin_user());

drop policy if exists cart_items_select_owned_or_admin on public.cart_items;
create policy cart_items_select_owned_or_admin
on public.cart_items
for select
to authenticated
using (public.current_user_owns_cart(cart_id) or public.is_admin_user());

drop policy if exists cart_items_insert_owned_or_admin on public.cart_items;
create policy cart_items_insert_owned_or_admin
on public.cart_items
for insert
to authenticated
with check (public.current_user_owns_cart(cart_id) or public.is_admin_user());

drop policy if exists cart_items_update_owned_or_admin on public.cart_items;
create policy cart_items_update_owned_or_admin
on public.cart_items
for update
to authenticated
using (public.current_user_owns_cart(cart_id) or public.is_admin_user())
with check (public.current_user_owns_cart(cart_id) or public.is_admin_user());

drop policy if exists cart_items_delete_owned_or_admin on public.cart_items;
create policy cart_items_delete_owned_or_admin
on public.cart_items
for delete
to authenticated
using (public.current_user_owns_cart(cart_id) or public.is_admin_user());
