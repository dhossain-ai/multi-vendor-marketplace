# Status

## Current Phase

Checkout and pending-order foundation completed.

---

## Project State Summary

The repository now includes the first end-to-end authenticated checkout foundation on top of the public catalog, auth, and cart slices.
Signed-in customers can validate a cart on the server, create a pending unpaid order with snapshot-backed order items, clear the cart after successful order creation, and review order history without relying on live product records.

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
- protected placeholder routes added for `/seller` and `/admin`
- cart schema migration added for `carts` and `cart_items`
- typed schema subset expanded to cover cart tables
- cart repository/data-access layer added for:
  - current cart reads
  - add item
  - update quantity
  - remove item
  - clear cart
- protected `/cart` page added with empty state, line items, quantity updates, remove actions, subtotal summary, and checkout entry point
- order schema migration added for:
  - `orders`
  - `order_items`
  - `payments` placeholder support for the next phase
- typed schema subset expanded to cover order and payment tables plus status enums
- checkout validation service added for:
  - authenticated ownership
  - cart reload from the server
  - product visibility and seller approval checks
  - quantity and MVP-safe stock checks
  - server-side totals calculation
- pending-order creation flow added with:
  - `order_status = pending`
  - `payment_status = unpaid`
  - snapshot-backed `order_items`
  - cart clearing after successful pending-order creation
- protected `/checkout` page added with validation feedback and pending-order submission
- customer order history foundation added at `/orders` and `/orders/[id]`
- order history UI now reads from snapshot-backed order data instead of live catalog rows
- header and account surfaces updated to expose checkout and order-history paths
- README updated to reflect the catalog, auth, cart, and checkout foundation
- `STATUS.md`, `NEXT_STEPS.md`, `DEV_SUMMARY.md`, `AI_CONTEXT.md`, and `ROADMAP.md` updated for the new baseline

---

## In Progress

- preparing the repository for payment session integration on top of the new pending-order flow
- keeping generated database types and live schema work aligned for future Supabase-backed features

---

## Not Started Yet

### Product / UX

- real payment provider integration
- seller onboarding flow
- seller dashboard features
- admin dashboard features
- coupon experience

### Backend / Business Logic

- payment session creation
- payment reconciliation and webhook handling
- richer order lifecycle transitions
- commission logic
- review/wishlist system

---

## Known Gaps

- catalog still uses an MVP-safe fallback dataset when live Supabase catalog data is unavailable
- the included cart and order migrations still need to be applied in the target Supabase project
- current database typing is still a hand-written subset and should later be replaced with generated Supabase types
- pending-order creation currently uses application-side compensation instead of a single database transaction
- checkout does not yet support coupons, taxes, addresses, or payment session attachment
- seller/admin routes remain protected placeholders only and do not include product or order management

---

## Current Priority

Move from checkout and pending-order groundwork into payment integration without weakening the cart, order snapshot, or ownership boundaries already in place.

---

## Immediate Focus

The next implementation focus should be:

- payment session integration
- payment record creation and status handling
- provider callback/webhook groundwork
- generated Supabase schema typing for repository-safe queries

---

## Risks

- letting pending-order UX imply payment is already confirmed
- duplicating checkout totals logic when payment attachment is introduced
- skipping idempotency planning once provider callbacks arrive
- docs drifting away from code once implementation starts
- delaying replacement of hand-written schema types once schema-backed queries become more important

---

## Readiness Assessment

The project is ready to move into implementation once:

- Supabase project credentials are configured locally
- the cart and order migrations have been applied to the target database
- the next slice is limited to payment integration and status handling
- docs continue to be updated alongside implementation
