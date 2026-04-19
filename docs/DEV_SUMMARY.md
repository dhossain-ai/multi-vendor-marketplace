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
- The roadmap currently still describes product detail/catalog hardening as Phase 1, so planning docs should reconcile that naming in the next documentation pass.

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
