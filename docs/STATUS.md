# Status

## Current Phase

Seller dashboard foundation completed (Phase 7).

---

## Project State Summary

The repository now includes a complete seller-facing area with dashboard summary, product management CRUD, and seller-scoped order visibility. All seller access is server-authoritative with strict ownership enforcement. Non-approved sellers see clear status messaging.

---

## Completed

- Next.js 16 App Router application initialized in-repo
- TypeScript and Tailwind CSS v4 configured
- ESLint configured and Prettier added
- `src/` folder structure established for app, components, features, lib, styles, and types
- public catalog landing page built on the homepage
- product detail route implemented at `/products/[slug]`
- reusable product card and detail presentation components added
- catalog repository/data-access layer added for listing, slug lookup, related products, and public slug generation
- server-side public visibility filtering applied for listing and detail reads
- MVP-safe local catalog fallback dataset added for environments without live Supabase catalog data
- Supabase client scaffolding added for browser, server, and admin usage
- Supabase auth flow wired for sign up, sign in, sign out, and auth callback handling
- server-side session loading added with application profile and seller profile lookup
- role and seller-status guards added for authenticated, seller, approved-seller, and admin checks
- minimal authenticated account experience added in the header and `/account`
- protected placeholder routes added for `/admin`
- cart schema migration added for `carts` and `cart_items`
- typed schema subset expanded to cover cart tables
- cart repository/data-access layer added for current cart reads, add/update/remove/clear
- protected `/cart` page added with empty state, line items, quantity updates, remove actions, subtotal summary, and checkout entry point
- order schema migration added for `orders`, `order_items`, and `payments`
- typed schema subset expanded to cover order and payment tables plus status enums
- checkout validation service added for ownership, product, seller, quantity, and totals checks
- pending-order creation flow with snapshot-backed order items and cart clearing
- protected `/checkout` page with validation feedback and pending-order submission
- customer order history foundation at `/orders` and `/orders/[id]`
- Stripe test-mode payment integration added:
  - `src/features/payments/` boundary with types, repository, service, and Stripe client
  - Stripe Checkout Session creation for pending orders with idempotency
  - Stripe webhook endpoint at `/api/webhooks/stripe` with signature verification
  - idempotent webhook handling for `checkout.session.completed` and `checkout.session.expired`
  - payment record creation and status tracking separate from order status
  - order status transitions: `pending`→`confirmed` and `unpaid`→`paid` on payment confirmation
  - checkout flow updated to redirect to Stripe Checkout after pending order creation
  - post-checkout success page with confirmation-safe messaging
  - post-checkout cancel page with retry flow
  - order detail view updated with color-coded payment/order status badges
  - "Pay now" / "Retry payment" button on unpaid pending orders
  - orders list view updated with color-coded status badges
  - environment config helpers for Stripe keys
  - graceful degradation when Stripe env vars are not configured
- seller dashboard foundation added:
  - `src/features/seller/` boundary with types, repositories, actions, and components
  - seller dashboard shell with layout-level role guard and pill-style navigation
  - seller status gate for pending/rejected/suspended/missing seller states
  - seller dashboard overview with metric cards (total/active/draft/archived products, paid orders, gross sales)
  - seller product management: list, create, edit, archive with ownership enforcement
  - seller product form with title, slug, descriptions, pricing, stock, status, thumbnail, category
  - seller products view with status badges, edit/archive actions, empty state
  - seller-scoped order items view with color-coded status badges and product snapshots
  - strict ownership enforcement: seller_id derived from session, never from client input
  - product status handling: sellers create draft/active, can archive; only admin can suspend
  - all seller routes protected: `/seller`, `/seller/products`, `/seller/products/new`, `/seller/products/[id]/edit`, `/seller/orders`
- README updated to reflect catalog, auth, cart, checkout, payment, and seller foundation
- docs updated for Phase 7 completion

---

## In Progress

- preparing the repository for admin dashboard work in the next phase

---

## Not Started Yet

### Product / UX

- admin dashboard features
- coupon experience
- seller onboarding application UI

### Backend / Business Logic

- commission logic
- refund workflows
- review/wishlist system

---

## Known Gaps

- catalog still uses an MVP-safe fallback dataset when live Supabase catalog data is unavailable
- the included migrations still need to be applied in the target Supabase project
- current database typing is a hand-written subset; join queries require two-query workarounds
- pending-order creation currently uses application-side compensation instead of a single database transaction
- checkout does not yet support coupons, taxes, or addresses
- admin route remains a protected placeholder only
- Stripe webhook endpoint needs production HTTPS and live webhook registration
- seller onboarding application UI not yet built (sellers must be created/approved via DB or admin tools)
- category selection in product form uses raw UUID input (category picker deferred to admin phase)

---

## Current Priority

Move from seller dashboard into admin dashboard and platform control features.

---

## Immediate Focus

The next implementation focus should be:

- admin dashboard shell and metrics
- seller approval/rejection admin flow
- product moderation admin view
- category management
- coupon management
- generated Supabase schema typing for repository-safe queries

---

## Risks

- delaying Supabase migrations application for too long
- docs drifting from code as more features are added
- delaying replacement of hand-written schema types (join queries are brittle)
- webhook endpoint not being HTTPS-accessible in local development without Stripe CLI
- no seller onboarding UI means sellers must be seeded or admin-created

---

## Readiness Assessment

The project is ready to move into admin dashboard implementation once:

- Supabase project credentials are configured locally
- all migrations have been applied to the target database
- Stripe test-mode keys are configured locally
- the next slice is limited to admin dashboard and platform controls
- docs continue to be updated alongside implementation
