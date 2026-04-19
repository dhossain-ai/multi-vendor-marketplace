# Status

## Current Phase

Cart foundation completed.

---

## Project State Summary

The repository now includes the first authenticated commerce slice on top of the public catalog and auth foundations.
Signed-in customers can add eligible products to a server-scoped cart, review cart contents, update quantities, remove items, and see a provisional subtotal without implementing checkout yet.

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
- server-side cart validation added for:
  - authenticated ownership
  - positive quantity rules
  - publicly purchasable product status
  - seller approval state
  - MVP-safe stock checks when limited stock is known
- protected `/cart` page added with empty state, line items, quantity updates, remove actions, and subtotal summary
- product detail pages now support add-to-cart
- header cart navigation now exposes cart access and signed-in item count
- environment template created with Supabase-related setup variables
- README updated to reflect the catalog, auth, and cart foundation
- `STATUS.md`, `NEXT_STEPS.md`, `DEV_SUMMARY.md`, and `AI_CONTEXT.md` updated for the new baseline

---

## In Progress

- preparing the repository for checkout validation and pending-order groundwork
- keeping generated database types and live schema work aligned for future Supabase-backed features

---

## Not Started Yet

### Product / UX

- checkout UI
- payment integration
- order persistence and lifecycle
- seller onboarding flow
- seller dashboard features
- admin dashboard features

### Backend / Business Logic

- checkout endpoint
- coupon system
- order creation flow
- review/wishlist system

---

## Known Gaps

- catalog still uses an MVP-safe fallback dataset when live Supabase catalog data is unavailable
- cart depends on the real Supabase schema for `carts` and `cart_items`; the included migration still needs to be applied in the target project
- current database typing is a maintainable hand-written subset and should still be replaced with generated Supabase types later
- cart totals are intentionally provisional and must be recalculated again during checkout
- unavailable items can remain visible in cart for cleanup, but checkout rules are not implemented yet
- seller/admin routes remain protected placeholders only and do not include product or order management

---

## Current Priority

Move from cart foundation into checkout groundwork without weakening the catalog, auth, or ownership boundaries already in place.

---

## Immediate Focus

The next implementation focus should be:

- checkout validation and pending-order groundwork
- payment/session planning after checkout contracts are stable
- generated Supabase schema typing for repository-safe queries

---

## Risks

- letting cart totals look final before checkout revalidation exists
- letting product-detail UI imply checkout is already implemented
- duplicating pricing or availability rules between cart and future checkout code
- docs drifting away from code once implementation starts
- delaying replacement of hand-written schema types once schema-backed queries become more important

---

## Readiness Assessment

The project is ready to move into implementation once:

- Supabase project credentials are configured locally
- the cart migration has been applied to the target database
- the next slice is limited to checkout groundwork
- docs continue to be updated alongside implementation
