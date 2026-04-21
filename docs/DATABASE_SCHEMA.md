# Database Schema

## Purpose

This document defines the intended database design for the marketplace platform. It focuses on core entities, relationships, constraints, indexing strategy, data integrity, and scalability considerations.

This schema is designed to support a realistic multi-vendor marketplace while remaining practical for a portfolio-grade modular monolith.

---

## Design Principles

### 1. Historical correctness

Orders must remain historically accurate even if products, prices, sellers, categories, or commission rules change later.

### 2. Clear ownership boundaries

Products belong to sellers. Customer data is isolated. Admin access is elevated and operational.

### 3. Safe mutation paths

Critical state transitions should be explicit and resistant to duplicate writes.

### 4. Query-aware structure

Hot paths such as listing, search, product detail, cart validation, and order history should be supported by appropriate indexes.

### 5. Soft-delete where history matters

Entities tied to historical records should prefer archival/suspension patterns over destructive deletion.

---

## Status and Enum Recommendations

## User Role

Recommended values:

- `customer`
- `seller`
- `admin`

Optional later:

- `support`
- `super_admin`

---

## Product Status

Recommended values:

- `draft`
- `active`
- `archived`
- `suspended`

---

## Seller Status

Recommended values:

- `pending`
- `approved`
- `rejected`
- `suspended`

---

## Order Status

Recommended values:

- `pending`
- `confirmed`
- `processing`
- `completed`
- `cancelled`
- `refunded`
- `partially_refunded`

---

## Payment Status

Recommended values:

- `unpaid`
- `processing`
- `paid`
- `failed`
- `refunded`
- `partially_refunded`

---

## Coupon Type

Recommended values:

- `fixed`
- `percentage`

---

## Core Entity Map

### Identity and Roles

- `profiles`
- `seller_profiles`
- `addresses`

### Catalog

- `categories`
- `products`
- `product_images`

### Commerce

- `carts`
- `cart_items`
- `coupons`
- `orders`
- `order_items`
- `payments`

### Experience

- `wishlists`
- `wishlist_items`
- `reviews`

### Marketplace Accounting

- `seller_commissions`
- `seller_payouts` (later phase)

### Operations and Audit

- `admin_audit_logs`
- `notifications` (later phase)

---

# Tables

## profiles

### Purpose

Stores application-level user profile information and role data. Tied to authenticated users.

### Key Columns

- `id` UUID PK, references auth user id
- `email` text unique
- `full_name` text nullable
- `role` user_role not null default `customer`
- `is_active` boolean not null default true
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

### Constraints

- unique email if stored here
- role must be valid enum
- id must match authenticated identity source

### Indexes

- primary key on `id`
- unique index on `email`
- index on `role`
- index on `is_active`

### Notes

- if auth provider stores canonical email elsewhere, keep this table aligned carefully
- role checks must not rely only on client-side session metadata

---

## seller_profiles

### Purpose

Stores seller-specific information separate from base user identity.

### Key Columns

- `id` UUID PK
- `user_id` UUID not null unique references `profiles(id)`
- `store_name` text not null
- `slug` text unique
- `status` seller_status not null default `pending`
- `bio` text nullable
- `logo_url` text nullable
- `commission_rate_bps` integer nullable
- `approved_at` timestamptz nullable
- `approved_by` UUID nullable references `profiles(id)`
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

### Constraints

- one seller profile per user
- unique store slug
- commission rate bounds must be validated if stored per seller

### Indexes

- unique index on `user_id`
- unique index on `slug`
- index on `status`
- index on `created_at`

### Notes

- seller status changes should not invalidate historical orders
- suspension should not hard-delete seller profile

---

## addresses

### Purpose

Stores customer shipping/billing addresses or general saved addresses.

### Key Columns

- `id` UUID PK
- `user_id` UUID not null references `profiles(id)`
- `label` text nullable
- `recipient_name` text not null
- `line_1` text not null
- `line_2` text nullable
- `city` text not null
- `state_region` text nullable
- `postal_code` text nullable
- `country_code` text not null
- `phone` text nullable
- `is_default` boolean not null default false
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

### Indexes

- primary key on `id`
- index on `user_id`
- partial index on (`user_id`) where `is_default = true`

### Notes

- if digital-only marketplace, this may be simplified
- do not embed mutable address data directly into live order display logic; snapshot at order time if needed

---

## categories

### Purpose

Groups products for navigation and filtering.

### Key Columns

- `id` UUID PK
- `name` text not null
- `slug` text not null unique
- `parent_id` UUID nullable references `categories(id)`
- `is_active` boolean not null default true
- `sort_order` integer not null default 0
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

### Constraints

- unique slug
- prevent invalid self-parent loops in application logic or constraint strategy if hierarchical depth is used

### Indexes

- unique index on `slug`
- index on `parent_id`
- index on `is_active`
- index on `sort_order`

### Notes

- avoid hard deletion if products still reference category
- category changes must not corrupt historical order items

---

## products

### Purpose

Stores seller-owned products visible in marketplace listings.

### Key Columns

- `id` UUID PK
- `seller_id` UUID not null references `seller_profiles(id)`
- `category_id` UUID nullable references `categories(id)`
- `title` text not null
- `slug` text not null unique
- `description` text nullable
- `short_description` text nullable
- `price_amount` numeric(12,2) not null
- `currency_code` text not null default 'USD'
- `stock_quantity` integer nullable
- `is_unlimited_stock` boolean not null default false
- `status` product_status not null default `draft`
- `thumbnail_url` text nullable
- `metadata` jsonb not null default '{}'::jsonb
- `published_at` timestamptz nullable
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

### Constraints

- unique slug
- non-negative price
- non-negative stock if stock tracked
- either unlimited stock or valid stock quantity strategy
- seller ownership required

### Indexes

- primary key on `id`
- unique index on `slug`
- index on `seller_id`
- index on `category_id`
- index on `status`
- index on `created_at desc`
- index on `published_at desc`
- composite index on (`status`, `category_id`, `published_at desc`)
- optional composite index on (`seller_id`, `status`, `updated_at desc`)

### Search Indexing

- trigram index on searchable text columns if fuzzy search continues here
- text search or search materialization may be introduced later if catalog grows

### Notes

- high-read table
- avoid destructive delete if orders reference products
- listing endpoints should minimize expensive joins
- metadata should be used carefully, not as a dumping ground for core relational fields

---

## product_images

### Purpose

Stores one-to-many product media references.

### Key Columns

- `id` UUID PK
- `product_id` UUID not null references `products(id)`
- `image_url` text not null
- `alt_text` text nullable
- `sort_order` integer not null default 0
- `created_at` timestamptz not null default now()

### Constraints

- product ownership implied through product relation

### Indexes

- primary key on `id`
- index on `product_id`
- composite index on (`product_id`, `sort_order`)

### Notes

- do not store unvalidated file paths blindly
- consider storage/CDN strategy later

---

## carts

### Purpose

Represents a user's active cart container.

### Key Columns

- `id` UUID PK
- `user_id` UUID not null unique references `profiles(id)`
- `coupon_id` UUID nullable references `coupons(id)`
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

### Constraints

- one active persistent cart per user in simplest model

### Indexes

- unique index on `user_id`
- index on `coupon_id`

### Notes

- guest carts may be handled outside DB first, then merged later
- cart is mutable and not historical source of truth

---

## cart_items

### Purpose

Stores items currently in a cart.

### Key Columns

- `id` UUID PK
- `cart_id` UUID not null references `carts(id)`
- `product_id` UUID not null references `products(id)`
- `quantity` integer not null
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

### Constraints

- quantity > 0
- unique constraint on (`cart_id`, `product_id`) for simple merge behavior

### Indexes

- primary key on `id`
- index on `cart_id`
- index on `product_id`
- unique index on (`cart_id`, `product_id`)

### Notes

- do not rely on cart item price as final price source unless explicitly snapshotting temporary values
- checkout must revalidate against current product state

---

## coupons

### Purpose

Stores platform or seller-level discount definitions.

### Key Columns

- `id` UUID PK
- `code` text not null unique
- `type` coupon_type not null
- `value_amount` numeric(12,2) not null
- `minimum_order_amount` numeric(12,2) nullable
- `usage_limit_total` integer nullable
- `usage_limit_per_user` integer nullable
- `starts_at` timestamptz nullable
- `expires_at` timestamptz nullable
- `is_active` boolean not null default true
- `seller_id` UUID nullable references `seller_profiles(id)`
- `created_by` UUID nullable references `profiles(id)`
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

### Constraints

- unique coupon code
- non-negative discount values
- date window validity rules
- seller_id null means platform-wide coupon

### Indexes

- unique index on `code`
- index on `is_active`
- index on `seller_id`
- index on `starts_at`
- index on `expires_at`

### Notes

- coupon validation must be enforced server-side
- usage tracking may require additional redemption table if complexity grows

---

## orders

### Purpose

Top-level purchase record created during checkout/payment flow.

### Key Columns

- `id` UUID PK
- `order_number` text not null unique
- `customer_id` UUID not null references `profiles(id)`
- `order_status` order_status not null
- `payment_status` payment_status not null
- `currency_code` text not null
- `subtotal_amount` numeric(12,2) not null
- `discount_amount` numeric(12,2) not null default 0
- `tax_amount` numeric(12,2) not null default 0
- `total_amount` numeric(12,2) not null
- `coupon_id` UUID nullable references `coupons(id)`
- `shipping_address_snapshot` jsonb nullable
- `billing_address_snapshot` jsonb nullable
- `placed_at` timestamptz nullable
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

### Constraints

- unique order number
- non-negative totals
- total should align with subtotal/discount/tax rules
- payment status and order status managed separately

### Indexes

- primary key on `id`
- unique index on `order_number`
- index on `customer_id`
- index on `order_status`
- index on `payment_status`
- index on `created_at desc`
- composite index on (`customer_id`, `created_at desc`)
- composite index on (`order_status`, `payment_status`, `created_at desc`)

### Notes

- historical source of truth
- high-sensitivity table
- should support idempotent order creation strategy
- should not depend on live product data for correctness

---

## order_items

### Purpose

Stores immutable or semi-immutable line items for each order.

### Key Columns

- `id` UUID PK
- `order_id` UUID not null references `orders(id)`
- `product_id` UUID nullable references `products(id)`
- `seller_id` UUID not null references `seller_profiles(id)`
- `product_title_snapshot` text not null
- `product_slug_snapshot` text nullable
- `unit_price_amount` numeric(12,2) not null
- `quantity` integer not null
- `line_subtotal_amount` numeric(12,2) not null
- `discount_amount` numeric(12,2) not null default 0
- `line_total_amount` numeric(12,2) not null
- `currency_code` text not null
- `fulfillment_status` fulfillment_status not null default `unfulfilled`
- `tracking_code` text nullable
- `shipment_note` text nullable
- `shipped_at` timestamptz nullable
- `delivered_at` timestamptz nullable
- `product_metadata_snapshot` jsonb not null default '{}'::jsonb
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

### Constraints

- quantity > 0
- fulfillment state is seller-operational data, not payment truth

### Notes

- multi-vendor seller fulfillment should update `order_items`, not the parent `orders` row directly
- parent `orders.order_status` may be synchronized from line-item fulfillment for marketplace-safe summaries
- non-negative amounts
- seller_id required even if product later disappears

### Indexes

- primary key on `id`
- index on `order_id`
- index on `seller_id`
- index on `product_id`
- composite index on (`seller_id`, `created_at desc`)
- composite index on (`order_id`, `seller_id`)

### Notes

- this table preserves purchase-time reality
- product_id may remain nullable only if deletion policy allows referenced row removal; otherwise prefer soft-delete and keep FK intact
- essential for seller reporting and historical order display

---

## payments

### Purpose

Stores payment provider interactions and payment state tracking.

### Key Columns

- `id` UUID PK
- `order_id` UUID not null references `orders(id)`
- `provider` text not null
- `provider_payment_id` text nullable
- `provider_session_id` text nullable
- `status` payment_status not null
- `amount` numeric(12,2) not null
- `currency_code` text not null
- `idempotency_key` text nullable
- `raw_provider_payload` jsonb nullable
- `paid_at` timestamptz nullable
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

### Constraints

- provider identifiers should be unique where applicable
- one order may have one or more payment attempts depending on design
- amount must be non-negative

### Indexes

- primary key on `id`
- index on `order_id`
- index on `status`
- unique index on `provider_payment_id` where not null
- unique index on `provider_session_id` where not null
- unique index on `idempotency_key` where not null
- composite index on (`order_id`, `created_at desc`)

### Notes

- webhook callbacks should use provider identifiers/idempotency safely
- raw payload retention is useful for debugging and audits
- do not trust client redirect alone for final state transitions

---

## wishlists

### Purpose

Represents a user's wishlist container.

### Key Columns

- `id` UUID PK
- `user_id` UUID not null unique references `profiles(id)`
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

### Indexes

- unique index on `user_id`

---

## wishlist_items

### Purpose

Stores products saved to a wishlist.

### Key Columns

- `id` UUID PK
- `wishlist_id` UUID not null references `wishlists(id)`
- `product_id` UUID not null references `products(id)`
- `created_at` timestamptz not null default now()

### Constraints

- unique (`wishlist_id`, `product_id`)

### Indexes

- index on `wishlist_id`
- index on `product_id`
- unique index on (`wishlist_id`, `product_id`)

---

## reviews

### Purpose

Stores customer reviews for purchased products.

### Key Columns

- `id` UUID PK
- `product_id` UUID not null references `products(id)`
- `customer_id` UUID not null references `profiles(id)`
- `order_item_id` UUID nullable references `order_items(id)`
- `rating` integer not null
- `title` text nullable
- `body` text nullable
- `is_visible` boolean not null default true
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

### Constraints

- rating bounded, e.g. 1 to 5
- uniqueness policy may be (`customer_id`, `product_id`, `order_item_id`) depending on review strategy

### Indexes

- index on `product_id`
- index on `customer_id`
- index on `is_visible`
- composite index on (`product_id`, `created_at desc`)

### Notes

- eligibility should be enforced in application/service logic
- moderation can toggle visibility without destructive deletion

---

## seller_commissions

### Purpose

Stores per-order-item commission accounting to preserve historical platform fee logic.

### Key Columns

- `id` UUID PK
- `order_item_id` UUID not null unique references `order_items(id)`
- `seller_id` UUID not null references `seller_profiles(id)`
- `commission_rate_bps` integer not null
- `commission_amount` numeric(12,2) not null
- `seller_net_amount` numeric(12,2) not null
- `currency_code` text not null
- `created_at` timestamptz not null default now()

### Constraints

- one commission record per order item in simple design
- non-negative financial values
- commission logic locked at creation time

### Indexes

- unique index on `order_item_id`
- index on `seller_id`
- composite index on (`seller_id`, `created_at desc`)

### Notes

- preserves historical accounting if commission policy changes later
- recommended even if payout automation is postponed

---

## seller_payouts

### Purpose

Tracks payout events to sellers. Recommended for later phase.

### Key Columns

- `id` UUID PK
- `seller_id` UUID not null references `seller_profiles(id)`
- `amount` numeric(12,2) not null
- `currency_code` text not null
- `status` text not null
- `reference` text nullable
- `created_at` timestamptz not null default now()
- `processed_at` timestamptz nullable

### Notes

- not required for initial MVP
- should not overwrite raw commission history

---

## admin_audit_logs

### Purpose

Records sensitive admin actions for operational traceability.

### Key Columns

- `id` UUID PK
- `admin_user_id` UUID not null references `profiles(id)`
- `action_type` text not null
- `target_table` text not null
- `target_id` UUID nullable
- `before_data` jsonb nullable
- `after_data` jsonb nullable
- `reason` text nullable
- `created_at` timestamptz not null default now()

### Indexes

- index on `admin_user_id`
- index on `target_table`
- index on `target_id`
- index on `created_at desc`

### Notes

- useful for admin moderation, seller suspensions, coupon changes, and manual order actions

---

# Relationship Summary

## Core Relationships

- `profiles` 1:1 `seller_profiles` for seller users
- `seller_profiles` 1:N `products`
- `categories` 1:N `products`
- `products` 1:N `product_images`
- `profiles` 1:1 `carts`
- `carts` 1:N `cart_items`
- `profiles` 1:N `orders`
- `orders` 1:N `order_items`
- `orders` 1:N `payments`
- `products` 1:N `reviews`
- `seller_profiles` 1:N `seller_commissions`
- `profiles` 1:1 `wishlists`
- `wishlists` 1:N `wishlist_items`

---

# Historical Snapshot Strategy

## Why Snapshots Matter

Historical purchase records must remain correct even if:

- product title changes
- product slug changes
- price changes
- seller profile changes
- category changes
- product is archived or suspended

## Snapshot Fields Recommended in `order_items`

- product title
- product slug
- selected metadata needed for display
- unit price
- currency
- seller at time of sale

## Optional Snapshot Fields in `orders`

- shipping address snapshot
- billing address snapshot
- coupon code snapshot if useful
- tax/fee components

---

# Deletion Strategy

## Prefer Soft Delete / Archive For

- products
- sellers
- categories
- coupons
- reviews if moderation is needed

## Avoid Hard Delete For

- orders
- order_items
- payments
- commission records
- audit logs

## Notes

Hard deletes on historically meaningful tables should be extremely limited.

---

# Concurrency and Integrity Considerations

## Cart and Checkout

- cart data is mutable and not authoritative for pricing
- checkout must revalidate product state and totals
- duplicate requests should not create duplicate confirmed orders

## Payments

- webhook and callback handlers must be idempotent
- provider identifiers should be unique where possible
- payment retries should be representable without corrupting order state

## Stock

If stock is tracked:

- stock decrement should be transaction-aware
- checkout/payment flow must define when stock is reserved vs finalized
- oversell prevention rules should be decided explicitly

---

# Row-Level Security and Access Strategy

## General Guidance

If Supabase RLS is used, access should align with business ownership rules.

## Customer Access

Customers can access:

- their own profile
- their own addresses
- their own cart and cart items
- their own orders and order items
- their own wishlist

## Seller Access

Sellers can access:

- their own seller profile
- their own products
- order items tied to their products or seller id
- their own commission records
- their own payout records if added

## Admin Access

Admins require elevated access patterns, typically through trusted server-side code rather than broad direct client DB access.

## Important Note

Do not depend solely on RLS for business correctness. Keep server-side authorization logic explicit.

---

# Performance Notes

## High-Read Tables

- `products`
- `categories`
- `product_images`
- `reviews`

## High-Sensitivity Tables

- `orders`
- `order_items`
- `payments`
- `seller_commissions`

## Hot Query Patterns

- product listing by status/category/sort
- product detail by slug
- fuzzy search/autocomplete
- customer order history
- seller order list
- admin order monitoring

## Recommended Early Indexes

- product status/category/published_at
- product slug
- product seller/status
- order customer/created_at
- order item seller/created_at
- payment provider identifiers
- coupon code
- seller status

---

# Scalability Notes

## Good Early Practices

- keep listing queries simple and index-friendly
- avoid deep join-heavy queries on hot paths
- paginate large lists
- separate read-optimized listing logic from write-heavy checkout logic
- use snapshots for historical order correctness
- use idempotency keys or unique provider references for payment safety

## What Not To Prematurely Add

- sharding
- microservices
- complex event buses
- over-normalization that hurts common reads
- excessive abstraction around simple tables

---

# Migration Strategy

## Principles

- every schema change should be migration-based
- destructive changes require caution
- enum/status changes should be planned carefully
- migration history should remain clear and reviewable

## Recommended Workflow

1. update `DATABASE_SCHEMA.md`
2. update `DECISIONS.md` if rationale changed
3. create migration
4. update `API_SPEC.md` or `FEATURE_SPEC.md` if behavior changes
5. update `STATUS.md` and `DEV_SUMMARY.md` after implementation

---

# MVP Schema Priority

The first implementation-ready schema set should focus on:

1. `profiles`
2. `seller_profiles`
3. `categories`
4. `products`
5. `product_images`
6. `carts`
7. `cart_items`
8. `coupons`
9. `orders`
10. `order_items`
11. `payments`

Secondary but important: 12. `reviews` 13. `wishlists` 14. `seller_commissions` 15. `admin_audit_logs`

Later: 16. `seller_payouts` 17. `notifications`

---

# Schema Decision Rules

When uncertain, prefer:

- historical correctness over convenience
- explicit ownership over ambiguous sharing
- index-aware design over naive generality
- archived records over destructive deletion
- separate order and payment state over oversimplified status modeling
