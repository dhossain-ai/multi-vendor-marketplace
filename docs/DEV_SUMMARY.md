# Dev Summary

## 2026-05-01 - Phase 17A Storefront Commerce UI Polish

### Summary

Polished the public storefront into a fuller ecommerce marketplace experience while preserving the existing backend/product rules. The pass focused on the global header, homepage, product discovery, product cards, product detail presentation, footer, responsive behavior, and documentation.

### Added

- storefront commerce UI audit at `docs/audits/phase-17a-storefront-commerce-ui-audit.md`
- implementation note at `docs/implementation/phase-17a-storefront-commerce-ui-polish.md`
- global header product search form that submits to `/products?q=...`
- homepage search, department cards, featured products shelf, new arrivals shelf, trust section, and seller CTA
- richer marketplace footer sections for shop, account, seller, and trust links

### Changed

- global header now has stronger marketplace navigation while preserving role-aware seller/admin visibility
- homepage now feels product-led and commerce-first
- product cards now have stronger image/fallback treatment, trimmed descriptions, availability badges, and clearer details CTAs
- `/products` now has a stronger browse header, search/sort toolbar, category chips, product count summary, pagination, and recovery actions
- product detail now has stronger gallery, title/price, seller/category, availability, add-to-cart, description, and related-products presentation

### Checks

- baseline `npm run lint`: passed
- baseline `npm run typecheck`: passed
- baseline `npm run build`: passed
- final `npm run lint`: passed
- final `npm run typecheck`: passed
- final `npm run build`: passed

### Notes

- Product visibility rules remain unchanged: approved seller, active product, active/valid category, existing publish requirements, and no suspended/archived/draft products.
- No wishlist, reviews, refunds, payouts, notifications, schema changes, checkout changes, seller approval changes, or admin operations were added.

### Next Recommended Slice

- Phase 17B: Product Listing, Product Card, and Product Detail Deep Polish.

## 2026-04-30 - Phase 16 Customer Flow Final QA and Security Cleanup

### Summary

Completed final QA and security cleanup for the customer/visitor lifecycle. The pass stayed scoped to customer-facing routes and fixed only defects found during review.

### Added

- final QA audit at `docs/audits/phase-16-customer-flow-final-qa.md`
- final documentation checkpoint for Phase 16 status and next steps

### Changed

- public catalog query params are now bounded and normalized
- public Supabase catalog reads now enforce active product, approved seller, and active category more directly in queries
- out-of-stock product detail pages remain visible but cannot add to cart
- checkout post-order cart cleanup rechecks cart ownership before deleting cart items or clearing coupon state
- terminal payment statuses cannot start another customer payment session
- checkout cancel retry links only render for UUID-shaped order IDs
- customer-facing implementation/test-mode wording was replaced with production-facing copy

### Checks

- `npm run lint`: passed
- `npm run typecheck`: passed
- `npm run build`: passed

### Notes

- Payment success remains webhook-authoritative.
- Order and payment status remain separate.
- Order snapshots remain historical and customer order reads remain customer-owned.
- Pending-order transaction/RPC and stronger duplicate-submit idempotency remain later reliability work.

### Next Recommended Slice

- Phase 17: Frontend UX and Presentation Polish.

## 2026-04-28 - Phase 14 Cart Checkout and Orders

### Summary

Connected customer addresses into checkout, made shipping address selection required for payment, snapshotted the selected address onto new orders, and fixed the Stripe total mismatch around discounted orders.

### Added

- saved-address selection on `/checkout`
- server-side selected-address ownership verification
- `orders.shipping_address_snapshot` population during pending order creation
- shipping address display on customer order detail
- aggregate Stripe Checkout line item that charges `orders.total_amount`
- clearer cart and checkout unavailable-item messages
- shopper-facing order copy refinements
- implementation note at `docs/implementation/phase-14-cart-checkout-orders.md`

### Notes

- Checkout still derives customer identity from the server session.
- Checkout accepts only `shippingAddressId`, not raw address fields or `user_id`.
- Billing address remains deferred.
- Pending order creation still uses application-side compensation rather than a transaction/RPC.

### Next Recommended Slice

- Phase 15: catalog/search/storefront reliability cleanup, including the catalog `cookies()` static-generation warning.

## 2026-04-28 - Phase 13 Customer Account and Addresses

### Summary

Implemented the missing customer account depth from the Phase 12 audit: profile editing, customer-owned address management, and checkout preparation for future shipping snapshots.

### Added

- `/account/profile` for authenticated customers to update `full_name`
- `/account/addresses` for address create, edit, delete, and default selection
- `public.addresses` migration with ownership RLS and default-address indexes
- account feature boundary with profile/address repositories, validation, server actions, and UI components
- checkout default-address preview with a link back to the address book
- implementation note at `docs/implementation/phase-13-customer-account-addresses.md`

### Notes

- Customer identity is derived from the server session; address forms never accept `user_id`.
- The first saved address becomes default automatically, and the database enforces at most one default address per user.
- Checkout does not yet select an address or populate `orders.shipping_address_snapshot`.
- Supabase type generation was unavailable in this environment, so the existing checked-in type subset was updated narrowly for `addresses`.

### Next Recommended Slice

- Phase 14: checkout shipping address selection and order shipping-address snapshots.

## 2026-04-19 - Phase 1 Bootstrap Foundation

### Summary

Initialized the repository as a new Next.js 16 App Router application and shaped it into a clean marketplace baseline aligned with the architecture docs.

### Added

- Next.js + TypeScript + Tailwind CSS application scaffold
- ESLint configuration from the app scaffold
- Prettier configuration and scripts
- base `src/` architecture:
  - `src/app`
  - `src/components`
  - `src/features`
  - `src/lib`
  - `src/styles`
  - `src/types`
- shared app shell with header/footer
- homepage placeholder that communicates project status without implying unfinished features exist
- Supabase browser/server/admin client scaffolding
- env helper module and `.env.example`
- project-specific README

### Notes

- This was a repository bootstrap phase, not a commerce feature phase.

### Next Recommended Slice

- product detail route and data access
- auth and role foundation
- generated Supabase database typings once schema work begins

## 2026-04-20 - Phase 2 Catalog Foundation

### Summary

Implemented the first real public marketplace slice: a catalog landing page, slug-based product detail pages, and a dedicated repository layer for catalog reads.

### Added

- catalog product types for lightweight listing and richer detail reads
- public catalog repository functions for:
  - product listing
  - product lookup by slug
  - related products
  - static slug generation
- public visibility rules enforced in server-side catalog reads
- demo catalog fallback dataset for environments without live Supabase catalog data
- reusable catalog UI:
  - hero
  - product card grid
  - detail view
  - loading state
  - unavailable-product state
- local catalog artwork assets under `public/catalog`

### Notes

- listing and detail queries are intentionally separated
- hidden states such as draft and unapproved-seller products are excluded from public output
- current public catalog is intentionally simple: no auth, cart, checkout, or dashboard behavior was added

### Next Recommended Slice

- auth and role foundation
- generated Supabase database types
- profile and seller-status groundwork for future protected routes

## 2026-04-20 - Phase 3 Auth and Roles Foundation

### Summary

Implemented the first protected application slice: Supabase-backed auth flows, server-side session/profile loading, and reusable role guard foundations for future customer, seller, and admin areas.

### Added

- auth pages and flow handling for:
  - sign in
  - sign up
  - sign out
  - auth callback exchange
- server-side session loader that resolves:
  - authenticated user
  - application profile
  - seller profile
- reusable auth/role guard helpers for:
  - authenticated users
  - role checks
  - seller-only access
  - approved-seller access
  - admin-only access
- minimal signed-in account experience:
  - header auth navigation
  - `/account`
  - protected placeholder routes for `/seller` and `/admin`
- typed schema subset for current auth and catalog tables instead of placeholder database records

### Notes

- role checks and seller approval checks are intentionally separate
- server-side guards are the source of truth; the header only reflects session state for navigation
- seller/admin pages are placeholders only and do not implement dashboard features yet
- current database typing is still a temporary subset until generated Supabase types are introduced

### Next Recommended Slice

- cart foundation for authenticated customers
- checkout validation and pending-order groundwork
- generated Supabase types once the live schema is ready

## 2026-04-20 - Phase 4 Cart Foundation

### Summary

Implemented the first authenticated commerce workflow: server-authoritative cart reads and writes, add-to-cart from product detail, and a protected cart page ready for checkout work in the next phase.

### Added

- cart schema migration for:
  - `carts`
  - `cart_items`
- cart types for:
  - cart items
  - cart snapshot state
  - availability labels
- cart repository functions for:
  - current cart loading
  - cart item count loading
  - add item
  - update quantity
  - remove item
  - clear cart
- server actions for:
  - add to cart
  - update quantity
  - remove item
  - clear cart
- cart UI:
  - add-to-cart form
  - protected `/cart`
  - empty state
  - line item rows
  - provisional subtotal summary
  - header cart navigation with item count

### Notes

- cart mutations are scoped to the authenticated user on the server
- cart validates public purchasability and uses MVP-safe limited-stock checks when stock is known
- cart totals are intentionally provisional and must be recalculated during checkout
- unavailable items remain visible in cart so the user can clean them up before checkout exists

### Next Recommended Slice

- checkout foundation
- pending-order creation strategy
- generated Supabase types once the live schema is ready

## 2026-04-20 - Phase 5 Checkout and Pending Orders

### Summary

Implemented the first server-authoritative checkout slice: cart revalidation, pending unpaid order creation, snapshot-backed order items, and customer order history built from durable order records.

### Added

- order schema migration for:
  - `orders`
  - `order_items`
  - `payments` placeholder support for the next phase
- checkout types for:
  - validated checkout items
  - server-calculated totals
  - validation result state
- checkout services for:
  - cart reload from the server
  - checkout validation
  - pending-order creation
  - cart clearing after successful pending-order creation
- checkout UI:
  - protected `/checkout`
  - validation feedback for stale or invalid cart state
  - pending-order submission flow
- order history foundation:
  - `/orders`
  - `/orders/[id]`
  - snapshot-backed order detail rendering

### Notes

- checkout is server-authoritative and does not trust cart totals from the client
- order history now reads from snapshots instead of live product data
- cart is cleared after successful pending-order creation to reduce accidental duplicate submissions from the same cart
- pending-order creation currently uses application-side compensation rather than a single database transaction
- payment provider integration, webhook handling, and payment reconciliation remain deferred to the next phase

### Next Recommended Slice

- payment integration in test mode
- payment record and status handling
- generated Supabase types once the live schema is ready

## 2026-04-20 - Phase 6 Payment Integration (Stripe Test Mode)

### Summary

Integrated Stripe test-mode payments: pending orders created in Phase 5 now redirect to Stripe Checkout, payments are tracked in a separate `payments` table, and webhook-driven status transitions confirm orders and mark payments as paid with full idempotency.

### Added

- payment feature boundary at `src/features/payments/`:
  - payment types for records, session results, and webhook results
  - Stripe SDK singleton client
  - payment repository for CRUD with typed Supabase update operations
  - payment service for Stripe Checkout Session creation and webhook processing
- Stripe webhook endpoint at `/api/webhooks/stripe`:
  - raw body signature verification
  - `checkout.session.completed` → payment `paid`, order `confirmed`/`paid`
  - `checkout.session.expired` → payment `failed`, order `payment_status` `failed`
  - idempotent: terminal states are never re-processed
- checkout flow updated:
  - pending order creation now followed by Stripe session creation and redirect
  - graceful degradation when Stripe env vars are absent (Phase 5 fallback)
  - `startPaymentAction` added for "Pay now" / "Retry payment" from order detail
- post-checkout pages:
  - `/checkout/success` with confirmation-safe messaging
  - `/checkout/cancel` with retry link
- order views updated:
  - order detail shows color-coded status badges and contextual payment messaging
  - "Pay now" button for unpaid pending orders, "Retry payment" for failed
  - orders list shows color-coded order and payment status badges
- environment config:
  - `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` added to `.env.example`
  - `getStripeSecretKey()`, `getStripeWebhookSecret()`, `hasStripeEnv()` helpers added
- checkout view copy updated for real payment flow language

### Notes

- payment status transitions are server-authoritative: only the Stripe webhook finalizes payment
- client-side success redirect shows "payment is being confirmed" — not "payment successful"
- cart clearing happens at pending order creation (Phase 5 behavior retained for MVP simplicity)
- existing processing payment records with open Stripe sessions are reused (idempotency)
- refund and partial-refund statuses exist in schema but are not exercised until a refund workflow phase

### Next Recommended Slice

- seller onboarding and dashboard
- admin dashboard
- generated Supabase types from real schema

## 2026-04-20 - Phase 7 Seller Dashboard Foundation

### Summary

Built the seller-facing area of the marketplace: dashboard shell with metrics, product management CRUD, and seller-scoped order visibility. All access is server-authoritative with strict ownership enforcement.

### Added

- seller feature boundary at `src/features/seller/`:
  - seller types for products, order items, form data, and dashboard summary
  - seller product repository with ownership-enforced CRUD (list, get, create, update, archive)
  - seller order repository with two-query approach for seller-scoped order items
  - seller dashboard repository with product counts and gross sales aggregation
  - seller server actions with approved-seller enforcement, form parsing, and validation
- seller UI components:
  - `seller-status-gate.tsx` — renders children only for approved sellers, shows status messaging for others
  - `seller-dashboard-view.tsx` — metric cards and quick-action links
  - `seller-products-view.tsx` — product list with status badges, edit/archive actions, empty state
  - `seller-product-form.tsx` — client component create/edit form with useFormStatus
  - `seller-orders-view.tsx` — order items with color-coded status badges and product snapshots
- seller routes:
  - `/seller` (layout with role guard, navigation, status gate)
  - `/seller` (dashboard with metrics)
  - `/seller/products` (product list)
  - `/seller/products/new` (create product)
  - `/seller/products/[id]/edit` (edit product with ownership verification)
  - `/seller/orders` (seller-scoped order items)
- ownership enforcement:
  - seller_id derived from authenticated session, never from client input
  - every repository function takes sellerProfileId as first argument
  - product queries always filter by seller_id
  - sellers cannot view or modify other sellers' products or orders

### Notes

- four-layer auth model: authenticated → seller role → seller profile → approved status
- product lifecycle: sellers create draft/active, can archive; only admin can suspend
- two-query workaround for order data due to missing Relationships in hand-written Database types
- seller onboarding UI deferred — sellers must be created/approved via DB or admin tools
- category selection uses raw UUID input until category management admin feature exists

### Next Recommended Slice

- admin dashboard and platform controls
- seller approval/rejection admin flow
- category and coupon management
- generated Supabase types from real schema

## 2026-04-20 - Phase 8 Admin Dashboard Foundation

### Summary

Built the admin-facing foundation of the marketplace: protected admin routes, platform summary metrics, seller moderation, product moderation, category and coupon management foundations, and platform-wide order monitoring.

### Added

- admin feature boundary at `src/features/admin/`:
  - admin types for dashboard summary, sellers, products, categories, coupons, and orders
  - repository modules for admin summary, seller moderation, product moderation, category management, coupon management, and order monitoring
  - server actions for admin mutations with server-authoritative role enforcement
  - reusable admin UI components for summary cards, navigation, status badges, moderation views, and order detail
- admin routes:
  - `/admin`
  - `/admin/sellers`
  - `/admin/products`
  - `/admin/categories`
  - `/admin/coupons`
  - `/admin/orders`
  - `/admin/orders/[id]`
- moderation rules:
  - seller transitions are explicit and allowlisted
  - admin product reactivation returns `suspended` products to `draft`
  - sellers can no longer edit or archive suspended products
- shared catalog/admin improvement:
  - seller product form now loads active categories from the database instead of raw UUID input
- schema support:
  - Phase 8 migration for `coupons` and `admin_audit_logs`
  - hand-written database type subset extended for new admin tables
  - best-effort admin audit log writes for sensitive admin actions

### Notes

- coupon storage and admin control exist, but checkout-side coupon validation is still deferred
- admin order tooling is intentionally read-only in this phase
- audit logging is intentionally lightweight and should be hardened later

### Next Recommended Slice

- checkout coupon validation and application
- seller onboarding/application UI
- generated Supabase types from the real schema

## 2026-04-20 - Phase 8.5 Database Foundation And Role Workflow Fix

### Summary

Repaired the Supabase foundation so the project can be initialized from a fresh database instead of depending on missing early-phase tables. The migration history now bootstraps roles, profiles, catalog tables, cart tables, coupons/audit logs, and order/payment tables in dependency-safe order.

### Added

- ordered migration chain under `supabase/migrations/`:
  - `202604200001_base_helpers_and_enums.sql`
  - `202604200002_auth_profile_foundation.sql`
  - `202604200003_catalog_foundation.sql`
  - `202604200004_cart_foundation.sql`
  - `202604200005_coupon_and_audit_foundation.sql`
  - `202604200006_checkout_orders_payments_foundation.sql`
- database-side profile bootstrap:
  - `auth.users` insert trigger to create `public.profiles`
  - auth update trigger to keep email/full name aligned
  - backfill insert for existing auth users
- helper SQL functions for:
  - admin role checks
  - current seller profile resolution
  - ownership checks for carts and orders
  - public product visibility checks
- minimal RLS policies for:
  - public catalog reads
  - customer-owned carts and orders
  - seller-owned product access
  - admin-only coupon/audit access
- repo setup docs:
  - explicit migration order
  - first-admin bootstrap query
  - schema verification steps in README
- app-side reconciliation improvement:
  - `ensureProfileForUser()` now tolerates duplicate profile creation races cleanly

### Notes

- the hand-written `src/types/database.ts` file still exists and should be replaced with generated Supabase types next
- existing partially-manual Supabase projects should be reset or reconciled before trusting them

### Next Recommended Slice

- generate real Supabase types from the finalized schema
- add coupon validation during checkout
- build seller onboarding/application UI

## 2026-04-20 - Reset Phase 2 Product UX Reset And Role Separation

### Summary

Reset the app experience so it feels like a real marketplace product instead of a milestone demo. The public side now reads like a storefront, the account area is customer-first, navigation is role-aware, and seller/admin areas use cleaner operational language.

### Added

- storefront home component with:
  - customer-facing hero
  - category highlights
  - featured product section
  - role-separation/trust messaging
- customer-facing order status label helper
- seller navigation component with active-tab behavior

### Changed

- shared product shell:
  - marketplace branding and tagline
  - role-aware global header
  - shopper-facing footer copy
- public catalog:
  - richer seed/demo catalog content
  - more realistic product card and product detail copy
  - improved empty and unavailable-product messaging
- customer journey:
  - customer-first account page
  - cleaner cart, checkout, order list, and order detail language
  - sign-in/sign-up copy aligned with real user journeys
- seller/admin journey clarity:
  - seller dashboard, listings, orders, and status messaging
  - admin dashboard, moderation, category/coupon, and order-monitoring copy

### Notes

- this reset focused on product coherence and role separation, not final polish
- seller onboarding, coupon redemption, and generated Supabase types remain the next deeper product steps
- the existing build-time warning about catalog slug generation touching `cookies()` is still present and should be addressed in the next reset slice

### Next Recommended Slice

- seller onboarding application flow
- checkout coupon redemption
- generated Supabase database types
- deeper customer account/profile management

## 2026-04-20 - Reset Phase 3 Seller Onboarding And Store Setup

### Summary

Turned the seller area into a real marketplace workflow: signed-in customers can now apply to sell from inside the app, seller approval states are visible and understandable, store settings have a real home, and seller product management now feels more like inventory management than placeholder CRUD.

### Added

- seller onboarding flow:
  - `/sell`
  - seller application action that creates `seller_profiles` through the app
  - store profile setup view and form
- seller settings route:
  - `/seller/settings`
  - editable store name, slug, bio, and optional logo URL
- seller status helper for consistent pending/approved/rejected/suspended copy

### Changed

- seller workspace:
  - seller layout no longer blocks all non-approved users at the shell level
  - dashboard messaging now reflects approval status and next steps
  - seller navigation includes store settings
- seller operations:
  - products and orders pages are now approved-only at the page level
  - product form now supports active category selection, stock rules, and gallery image URLs
  - product list shows category, image coverage, and inventory state
- role-aware UX:
  - account page now includes a seller application or seller setup entry point
  - global header now shows `Sell`, `Seller Setup`, or `Seller Dashboard` based on role/status
- admin moderation compatibility:
  - seller-status changes now revalidate seller onboarding/settings surfaces too

### Notes

- seller role and seller approval status remain separate
- seller profile creation is now app-driven, not manual-SQL-driven
- product and order tools remain server-authoritative and require approved seller status in server actions

### Next Recommended Slice

- coupon redemption and totals during checkout
- generated Supabase database types
- deeper customer account/profile management
- richer seller image handling once the core workflow is stable

## 2026-04-20 - Reset Phase 4 Marketplace Operations

### Summary

Made the marketplace feel operationally real: sellers now work from seller-scoped fulfillment views instead of read-only order history, customers can follow clearer order progress, coupons participate in real cart/checkout totals, and admin monitoring reflects operational state instead of placeholder labels.

### Added

- marketplace operations migration:
  - `202604200007_marketplace_operations_reset.sql`
  - `fulfillment_status` enum
  - `carts.coupon_id`
  - `order_items` fulfillment fields, timestamps, and trigger support
  - seller fulfillment update policy and order-status sync trigger
- coupon evaluation service for:
  - active/inactive and date-window validation
  - platform-wide vs seller-scoped applicability
  - minimum-order checks
  - total/per-user usage limits
- seller order detail route:
  - `/seller/orders/[id]`
  - seller-scoped fulfillment update forms
- shared order progress helper for operational-stage labels and descriptions

### Changed

- cart and checkout:
  - coupon apply/remove flow in cart
  - server-authoritative coupon totals in checkout
  - pending orders now persist coupon and line-item discount amounts
- customer orders:
  - clearer operational stage badges
  - item-level fulfillment, tracking, and shipment-note visibility
- seller operations:
  - seller orders are grouped into real order summaries
  - seller fulfillment updates are limited to seller-owned `order_items`
  - product inventory labels now distinguish low stock
- admin operations:
  - admin order views show operational stage and line-item fulfillment details
  - admin product moderation view now surfaces inventory state more clearly

### Notes

- payment truth remains separate from fulfillment truth
- seller fulfillment updates operate on `order_items`, not the entire `orders` row
- build still warns about catalog static generation touching `cookies()` and falling back to demo data during build

### Next Recommended Slice

- generate real Supabase types from the applied schema
- deepen customer profile/account management
- resolve the catalog build-time `cookies()` warning
- harden post-reset auditability and reliability

## 2026-04-27 - Seller Flow Recovery Phases 0–10

### Summary

Successfully planned, audited, and implemented a robust, secure, and production-ready seller/vendor workflow. This recovery hardens the platform into a true multi-vendor marketplace by establishing strict boundaries between customers, sellers, and admins. 

### Completed

- **Phases 0-2**: Created the seller workflow blueprint, audited the previous codebase, and laid out the implementation plan.
- **Phase 3**: Consolidated the database foundation and type subset for sellers.
- **Phase 4**: Implemented the seller registration and application/resubmission flow (`/seller/register`).
- **Phase 5**: Developed the admin moderation tools to review, approve, reject, and suspend sellers, including a verified-email approval gate and status history tracking.
- **Phase 6**: Cleaned up the status-aware seller dashboard and store settings, introducing slug locks after approval.
- **Phase 7**: Hardened product and inventory rules, requiring active products to possess categories, valid prices, images, and valid stock levels.
- **Phase 8**: Refined seller order privacy and fulfillment rules. Scoped order views to strictly seller-owned items, hid customer email addresses by default, bound fulfillment transitions, and removed seller-side cancellation of paid items.
- **Phases 9-10**: Executed a comprehensive manual QA and server-side security audit, followed by this documentation checkpoint and handoff.

### Next Recommended Slice

- customer/visitor workflow blueprint and audit
- deepen customer account management (profile and addresses)
- cart, checkout, and order history cleanup
