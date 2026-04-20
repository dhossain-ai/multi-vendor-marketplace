# Dev Summary

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
