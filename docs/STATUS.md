# Status

## Current Phase

Reset Phase 10 — Seller Flow Recovery completed.

---

## Project State Summary

The repository now behaves like a much more operational marketplace product across shopper, seller, and admin journeys. The public side is shopper-first, sellers can move paid orders through fulfillment with clear state changes, coupon logic now participates in real cart/checkout totals, and admin order/product views reflect marketplace operations instead of placeholder monitoring.

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
- protected admin route foundation expanded into a full admin area
- authenticated cart foundation completed
- checkout, pending-order creation, and snapshot-backed customer order history completed
- Stripe test-mode payment integration completed
- seller dashboard foundation completed
- admin dashboard foundation completed
- product UX reset completed:
  - storefront-style homepage with customer-facing sections
  - richer seeded catalog content visible on the public side
  - role-aware global navigation
  - customer-first account page
  - cleaner customer, seller, and admin wording across key screens
  - better separation between shopper, seller, and admin journeys
- seller onboarding and store setup reset completed:
  - `/sell` application flow for authenticated customers
  - in-app creation of `seller_profiles` without manual SQL
  - seller settings page for store name, slug, bio, and optional logo URL
  - clear seller state handling for no profile, pending, approved, rejected, and suspended
  - seller dashboard messaging aligned to approval state
  - seller product form upgraded with category selection, stock rules, and gallery image URLs
  - seller product list upgraded with category, image-count, and inventory visibility
  - global header and account page now expose seller entry points intentionally
- marketplace operations reset completed:
  - seller orders are now grouped into real seller order summaries
  - seller order detail page added at `/seller/orders/[id]`
  - seller-scoped fulfillment updates now support `processing`, `shipped`, `delivered`, and `cancelled`
  - line-item fulfillment lives on `order_items`, preserving payment truth separately from fulfillment progress
  - checkout now validates and applies coupons server-side
  - cart and checkout totals now show real coupon discount handling
  - order-item discount amounts now persist into pending orders
  - customer order history/detail now show clearer operational stages and fulfillment progress
  - admin order monitoring now reflects operational stage plus line-item fulfillment details
  - admin product moderation now shows inventory state more clearly
- seller recovery completed (Phases 0-10):
  - seller registration/application at `/seller/register`
  - seller pending/rejected/resubmission flow
  - admin seller approval/rejection/suspension/reactivation
  - verified-email approval gate
  - seller status history/audit trail
  - status-aware seller dashboard
  - store settings with slug lock after approval
  - seller-owned product management
  - product publish validation
  - inventory rules and low-stock threshold
  - seller-owned order visibility
  - seller fulfillment transitions
  - tracking code/shipment note
  - customer email hidden from seller views
  - seller cancellation of paid items blocked
- database foundation repaired for fresh Supabase projects:
  - ordered migration chain under `supabase/migrations/`
  - shared helper + enum migration
  - auth/profile foundation with `auth.users` -> `public.profiles` trigger bootstrap
  - catalog foundation for `categories`, `products`, and `product_images`
  - cart foundation for `carts` and `cart_items`
  - coupon + admin audit foundation
  - checkout/order/payment foundation for `orders`, `order_items`, and `payments`
  - minimal RLS/policy foundation for public catalog, customer ownership, seller ownership, and admin access fallback
  - README and docs updated with exact database setup and first-admin bootstrap steps

---

## In Progress

- preparing the next cleanup slice around generated Supabase types, customer account depth, and catalog build-time reliability

---

## Not Started Yet

### Product / UX

- customer profile/address management
- richer seeded order scenarios and account realism
- storefront reliability cleanup for static catalog generation

### Backend / Business Logic

- commission logic
- refund workflows
- review/wishlist system
- generated Supabase types from the finalized live schema

### Remaining Seller Follow-ups
- Supabase Storage/CDN image uploads
- bulk inventory updates
- seller coupons/campaigns
- seller messaging/support inbox
- seller staff/team accounts
- payouts/Stripe Connect
- refund/admin exception operations
- notifications

---

## Known Gaps

- current database typing is still a hand-written subset, although it now matches the new bootstrap chain
- existing partially-manual Supabase projects should be reset or reconciled before trusting them
- pending-order creation currently uses application-side compensation instead of a single database transaction
- checkout now supports coupon validation and discounts, but still does not support taxes or addresses
- Stripe webhook endpoint needs production HTTPS and live webhook registration
- admin audit logging is best-effort and should be hardened later
- build output still warns that catalog slug generation falls back to demo data because `cookies()` are touched during static product slug generation

---

## Current Priority

Stabilize the operational model with generated Supabase types, deeper customer account realism, and the lingering catalog build-time warning cleanup.

---

## Immediate Focus

The next implementation focus should be:

- generate real Supabase database types from an applied project
- improve customer profile/account management beyond the current summary view
- resolve the catalog `cookies()` static-generation fallback warnings
- harden fulfillment permissions and auditability after one real Supabase migration apply

---

## Risks

- letting the hand-written database types drift again after the schema is now stabilized
- continuing development against a partially initialized Supabase project instead of a clean migration run
- docs drifting from code as more features are added
- webhook endpoint not being HTTPS-accessible in local development without Stripe CLI
- allowing shopper, seller, and admin language to drift apart again after the reset
- letting order-level and line-item fulfillment state drift apart after the new operations model

---

## Readiness Assessment

The project is ready to move into the next refinement slice once:

- the new migration chain has been applied to the target Supabase project
- the first admin has been promoted explicitly
- Stripe test-mode keys are configured locally
- the next slice is limited to generated types, customer-account realism, storefront reliability cleanup, and post-operations hardening
- docs continue to be updated alongside implementation
