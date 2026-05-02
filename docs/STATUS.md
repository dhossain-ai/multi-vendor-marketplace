# Status

## Current Phase

Phase 17B - Product Discovery UI Polish completed.

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
- customer account and address management completed:
  - `/account/profile` added for authenticated profile editing
  - `/account/addresses` added for customer-owned address book management
  - `public.addresses` migration added with owner/admin RLS
  - address create/edit/delete/default actions derive ownership from the server session
  - checkout previews the default shipping address without requiring address selection yet
- address database verification and typegen unblock completed:
  - linked dev project `hhfcmcopjvyitjxcrmoy` verified
  - address migration applied to the linked dev database
  - remote schema/RLS/index/trigger checks completed for `public.addresses`
  - `src/types/database.ts` regenerated from the linked dev project
- cart, checkout, and customer order cleanup completed:
  - checkout now requires a saved customer shipping address
  - checkout verifies selected address ownership server-side
  - pending orders snapshot the selected shipping address at creation time
  - customer order detail displays the saved shipping snapshot
  - Stripe Checkout now charges the server-calculated order total
  - cart and checkout unavailable-item copy now gives clearer next actions
- catalog static generation `cookies()` warnings fixed by separating public Supabase client
- `/products` storefront listing route added with search, category, sort, and pagination
- catalog queries enforce strict visibility rules (active product, approved seller, active category)
- demo fallback data scoped cleanly, no longer masking real Supabase failures
- customer flow final QA completed:
  - baseline and final lint/typecheck/build checks passed
  - public catalog query params bounded and normalized
  - out-of-stock product detail remains visible but cannot add to cart
  - checkout post-order cart cleanup ownership rechecked server-side
  - payment retry/cancel edges tightened
  - customer-facing implementation/test-mode wording cleaned up
- storefront commerce UI polish completed:
  - global header now includes marketplace promise copy, product search, shop navigation, cart, and role-aware account/seller/admin links
  - homepage now presents a fuller commerce storefront with hero visuals, search, departments, featured products, new arrivals, trust messaging, and seller CTA
  - product cards now show stronger image treatment, price, category, seller, trimmed description, availability badge, and details CTA
  - `/products` listing now has stronger browse copy, search/sort toolbar, category chips, product count summary, pagination, and no-results recovery actions
  - product detail and footer received marketplace presentation polish
  - public product visibility rules remain unchanged
- product discovery UI polish completed:
  - `/products` now has a deeper ecommerce browsing layout with stronger search/sort hierarchy, department navigation, active filters, result range copy, pagination, and no-results recovery
  - product cards now have stronger image proportions, price/category hierarchy, seller label, availability badge, trimmed description, CTA, and focus states
  - product image fallbacks now render as polished category-aware product visuals
  - product detail now has a larger gallery, stronger purchase panel, seller trust block, product details, and related products presentation
  - product visibility rules and add-to-cart server behavior remain unchanged

---

## In Progress

- preparing Phase 17C

---

## Not Started Yet

### Product / UX

- richer seeded order scenarios and account realism

### Backend / Business Logic

- commission logic
- refund workflows
- review/wishlist system
- keep generated Supabase types current as migrations change

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

- existing partially-manual Supabase projects should be reset or reconciled before trusting them
- pending-order creation currently uses application-side compensation instead of a single database transaction
- pending-order creation currently needs stronger idempotency around duplicate submissions
- Stripe webhook endpoint needs production HTTPS and live webhook registration
- admin audit logging is best-effort and should be hardened later
- full-text catalog search remains deferred until the catalog grows beyond simple search needs

---

## Current Priority

Move into Phase 17C - Cart, Checkout, Account, and Order UI Polish.

---

## Immediate Focus

Polish cart, checkout, account, and order presentation without changing checkout, payment, seller approval, or admin behavior.

---

## Risks

- letting generated database types drift after new migrations
- continuing development against a partially initialized Supabase project instead of a clean migration run
- docs drifting from code as more features are added
- webhook endpoint not being HTTPS-accessible in local development without Stripe CLI
- allowing shopper, seller, and admin language to drift apart again after the reset
- letting order-level and line-item fulfillment state drift apart after the new operations model

---

## Readiness Assessment

The project is ready to move into Phase 17C once:

- the cart, checkout, account, and order polish scope is defined
- docs continue to be updated alongside implementation
