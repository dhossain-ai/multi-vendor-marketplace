create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid null references public.categories(id) on delete set null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint categories_not_self_parent check (parent_id is null or parent_id <> id)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.seller_profiles(id) on delete restrict,
  category_id uuid null references public.categories(id) on delete set null,
  title text not null,
  slug text not null unique,
  description text null,
  short_description text null,
  price_amount numeric(12,2) not null,
  currency_code text not null default 'USD',
  stock_quantity integer null,
  is_unlimited_stock boolean not null default false,
  status public.product_status not null default 'draft',
  thumbnail_url text null,
  metadata jsonb not null default '{}'::jsonb,
  published_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint products_price_non_negative check (price_amount >= 0),
  constraint products_stock_quantity_non_negative check (
    stock_quantity is null or stock_quantity >= 0
  )
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text null,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists categories_parent_id_idx on public.categories (parent_id);
create index if not exists categories_is_active_idx on public.categories (is_active);
create index if not exists categories_sort_order_idx on public.categories (sort_order, name);

create index if not exists products_seller_id_idx on public.products (seller_id);
create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists products_status_idx on public.products (status);
create index if not exists products_created_at_desc_idx on public.products (created_at desc);
create index if not exists products_published_at_desc_idx on public.products (published_at desc nulls last);
create index if not exists products_status_category_published_at_idx
  on public.products (status, category_id, published_at desc nulls last);
create index if not exists products_seller_status_updated_at_idx
  on public.products (seller_id, status, updated_at desc);

create index if not exists product_images_product_id_idx on public.product_images (product_id);
create index if not exists product_images_product_id_sort_order_idx
  on public.product_images (product_id, sort_order);

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

create or replace function public.is_active_category(target_category_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    target_category_id is null
    or exists (
      select 1
      from public.categories
      where public.categories.id = target_category_id
        and public.categories.is_active = true
    )
$$;

create or replace function public.is_product_publicly_visible(
  target_status public.product_status,
  target_seller_id uuid,
  target_category_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    target_status = 'active'
    and exists (
      select 1
      from public.seller_profiles
      where public.seller_profiles.id = target_seller_id
        and public.seller_profiles.status = 'approved'
    )
    and public.is_active_category(target_category_id),
    false
  )
$$;

grant all on public.categories to service_role;
grant select on public.categories to anon;
grant select, insert, update, delete on public.categories to authenticated;

grant all on public.products to service_role;
grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;

grant all on public.product_images to service_role;
grant select on public.product_images to anon;
grant select, insert, update, delete on public.product_images to authenticated;

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;

drop policy if exists categories_select_active_public on public.categories;
create policy categories_select_active_public
on public.categories
for select
to anon, authenticated
using (is_active = true);

drop policy if exists categories_select_admin_all on public.categories;
create policy categories_select_admin_all
on public.categories
for select
to authenticated
using (public.is_admin_user());

drop policy if exists categories_write_admin_only on public.categories;
create policy categories_write_admin_only
on public.categories
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists products_select_public_visible on public.products;
create policy products_select_public_visible
on public.products
for select
to anon, authenticated
using (public.is_product_publicly_visible(status, seller_id, category_id));

drop policy if exists products_select_owned_or_admin on public.products;
create policy products_select_owned_or_admin
on public.products
for select
to authenticated
using (public.current_user_can_manage_seller_profile(seller_id) or public.is_admin_user());

drop policy if exists products_insert_owned_or_admin on public.products;
create policy products_insert_owned_or_admin
on public.products
for insert
to authenticated
with check (public.current_user_can_manage_seller_profile(seller_id) or public.is_admin_user());

drop policy if exists products_update_owned_or_admin on public.products;
create policy products_update_owned_or_admin
on public.products
for update
to authenticated
using (public.current_user_can_manage_seller_profile(seller_id) or public.is_admin_user())
with check (public.current_user_can_manage_seller_profile(seller_id) or public.is_admin_user());

drop policy if exists products_delete_admin_only on public.products;
create policy products_delete_admin_only
on public.products
for delete
to authenticated
using (public.is_admin_user());

drop policy if exists product_images_select_public_visible on public.product_images;
create policy product_images_select_public_visible
on public.product_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products
    where public.products.id = product_id
      and public.is_product_publicly_visible(
        public.products.status,
        public.products.seller_id,
        public.products.category_id
      )
  )
);

drop policy if exists product_images_select_owned_or_admin on public.product_images;
create policy product_images_select_owned_or_admin
on public.product_images
for select
to authenticated
using (
  exists (
    select 1
    from public.products
    where public.products.id = product_id
      and (
        public.current_user_can_manage_seller_profile(public.products.seller_id)
        or public.is_admin_user()
      )
  )
);

drop policy if exists product_images_insert_owned_or_admin on public.product_images;
create policy product_images_insert_owned_or_admin
on public.product_images
for insert
to authenticated
with check (
  exists (
    select 1
    from public.products
    where public.products.id = product_id
      and (
        public.current_user_can_manage_seller_profile(public.products.seller_id)
        or public.is_admin_user()
      )
  )
);

drop policy if exists product_images_update_owned_or_admin on public.product_images;
create policy product_images_update_owned_or_admin
on public.product_images
for update
to authenticated
using (
  exists (
    select 1
    from public.products
    where public.products.id = product_id
      and (
        public.current_user_can_manage_seller_profile(public.products.seller_id)
        or public.is_admin_user()
      )
  )
)
with check (
  exists (
    select 1
    from public.products
    where public.products.id = product_id
      and (
        public.current_user_can_manage_seller_profile(public.products.seller_id)
        or public.is_admin_user()
      )
  )
);

drop policy if exists product_images_delete_owned_or_admin on public.product_images;
create policy product_images_delete_owned_or_admin
on public.product_images
for delete
to authenticated
using (
  exists (
    select 1
    from public.products
    where public.products.id = product_id
      and (
        public.current_user_can_manage_seller_profile(public.products.seller_id)
        or public.is_admin_user()
      )
  )
);
