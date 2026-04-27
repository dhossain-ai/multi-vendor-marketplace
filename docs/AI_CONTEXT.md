# AI Context

## Purpose

This file is the primary handoff document for new AI chats/models working on this repository. It provides the minimum accurate context needed to continue work safely and consistently without re-discovering the project from scratch.

This file should be updated whenever the project direction, architecture, priorities, or major implementation status changes.

---

## Project Mission

This repository is a production-minded full-stack multi-vendor marketplace platform under active phased implementation.

The current application now provides:

- shopper-first storefront homepage and product detail pages
- Supabase-backed auth, cart, checkout, payments, seller, and admin foundations
- in-app seller onboarding and store setup
- seller-scoped fulfillment operations and coupon-aware checkout totals
- role-aware navigation and a customer-first account area
- server-side session/profile/seller-profile loading
- a real Supabase migration chain that can initialize a fresh project from scratch

The goal remains a realistic commerce system with:

- customer flows
- seller/vendor flows
- admin controls
- checkout/payment handling
- order lifecycle management
- scalable and well-documented architecture

---

## Current Implementation Snapshot

### Completed

- Next.js App Router setup
- TypeScript + Tailwind CSS
- ESLint + Prettier
- Supabase client scaffolding
- public catalog landing page
- public product detail page by slug
- catalog repository/data layer for listing, slug lookup, related products, and static slugs
- visibility-safe public catalog behavior
- demo catalog fallback dataset when live catalog data is unavailable
- richer seeded marketplace product content for a less empty storefront
- sign-in, sign-up, sign-out, and auth callback flow
- server-side session/profile/seller-profile loading
- role-aware route guard utilities
- cart foundation
- checkout and pending-order creation
- coupon validation and discount persistence during checkout
- Stripe test-mode payment integration
- seller dashboard foundation
- seller order detail and fulfillment updates
- seller onboarding and store setup:
  - `/sell` public landing page
  - `/seller/register` seller application/resubmission flow
  - admin seller review and status management at `/admin/sellers/[id]`
  - `/seller/settings` store profile management
  - approval-state-aware seller workspace and server-protected navigation
  - category-aware, inventory-aware seller product form with server-side validation
  - seller order privacy (customer email hidden, scoped to seller items)
  - hardened seller fulfillment rules (no seller cancellations)
- admin dashboard foundation
- admin order and product monitoring with operational-state visibility
- product UX reset:
  - storefront-style homepage
  - cleaner shopper-facing copy
  - customer-first account page
  - clearer seller/admin operational language
  - stronger customer/seller/admin separation in navigation
- real database foundation:
  - ordered Supabase migration chain under `supabase/migrations/`
  - base enum/helper migration
  - auth/profile foundation with `auth.users` -> `public.profiles` trigger bootstrap
  - catalog foundation for categories/products/product_images
  - cart foundation for carts/cart_items
  - coupon and admin audit foundation
  - checkout/order/payment foundation
  - minimal RLS foundation for public catalog, customer ownership, seller ownership, and admin fallback access
  - explicit first-admin bootstrap documentation
- lint/typecheck/build verification

### Not Yet Implemented

- commission logic
- reviews
- wishlist
- notification workflows
- payout/refund tooling

---

## Current Product Positioning

Treat the project as a **working marketplace MVP** with clearly separated customer, seller, and admin journeys.

It is not final-polish complete yet, but it should no longer be described like an internal architecture demo.

Acceptable descriptions:

- multi-vendor marketplace with shopper storefront, seller tools, admin tools, and payment integration
- marketplace MVP with a real Supabase schema bootstrap chain and role-separated UX
- full-stack marketplace platform with server-authoritative ownership, moderation, and payment flow

---

## Current Tech Stack

### Frontend

- Next.js App Router
- TypeScript
- Tailwind CSS

### Backend / Data

- Supabase
- PostgreSQL
- repository/data access layer

### Tooling

- ESLint
- Prettier
- Supabase CLI available via `npx supabase`

### Deployment

- Vercel

---

## Architecture Direction

The intended architecture is a modular monolith suitable for a portfolio-grade product and future scaling.

Preferred structure:

- UI components isolated from domain logic
- API routes and server actions handling orchestration
- repository/data layer abstracting direct DB queries
- explicit business rules documented in `FEATURE_SPEC.md`
- schema and constraints documented in `DATABASE_SCHEMA.md`

Do not jump to microservices prematurely.

---

## Engineering Guardrails

### 1. Do not weaken server-side business rules

Critical rules must be enforced on the server:

- authorization
- role access
- cart ownership
- checkout totals
- stock/availability checks
- order creation
- payment confirmation handling

### 2. Preserve historical correctness

Order data must not depend on mutable product records after purchase. Use order snapshots for titles, prices, seller information, and relevant metadata that must survive later catalog changes.

### 3. Separate payment state from order state

Do not collapse everything into a single status field.

### 4. Prefer idempotent write paths

Checkout, payment callbacks/webhooks, and other sensitive mutations must be designed to tolerate retries and duplicate requests.

### 5. Keep the database foundation migration-based

All schema changes should extend the ordered migration chain. Do not add ad-hoc SQL snippets that bypass migration history.

### 6. Keep docs aligned with code

When implementation changes meaningfully, update the relevant docs:

- `STATUS.md`
- `NEXT_STEPS.md`
- `DEV_SUMMARY.md`
- `DATABASE_SCHEMA.md`
- `DECISIONS.md`
- `README.md`

---

## Product Rules to Preserve

- role enforcement must be server-side
- cart ownership and mutation checks must be server-side
- checkout totals must be calculated on the server
- coupon totals and eligibility must be calculated on the server
- pending orders must use snapshot-backed order items
- fulfillment state belongs on seller-owned `order_items`, not on payment records
- seller data access must be isolated to seller-owned resources
- admin capabilities must be explicit and auditable
- coupons must be validated server-side when introduced
- payment success from client-side redirect alone is not enough for final order completion
- important mutations should be resistant to duplicate submissions
- old orders must remain readable even if product data changes later
- seller role and seller approval status are separate concepts
- first admin bootstrap must stay explicit, never automatic

---

## Current Documentation Map

Use these files as the source of truth for specific concerns:

- `PROJECT_OVERVIEW.md` — product and engineering summary
- `ROADMAP.md` — phased plan and sequencing
- `FEATURE_SPEC.md` — business behavior and edge cases
- `DATABASE_SCHEMA.md` — schema design and constraints
- `DECISIONS.md` — rationale for important choices
- `STATUS.md` — current live progress
- `NEXT_STEPS.md` — immediate next work
- `DEV_SUMMARY.md` — historical progression

---

## Coding Preferences

When extending the codebase:

- prefer clear and explicit code over clever abstractions
- keep domain logic out of presentation-heavy components
- prefer typed interfaces and predictable data shapes
- keep naming business-oriented and consistent
- do not bypass repository or server-side validation for convenience
- document schema or role workflow changes carefully

---

## Current Priority Order

The next major work should generally follow this order:

1. customer/visitor code audit against `docs/blueprint/01-customer-flow.md`
2. implement customer account/address management
3. cart, checkout, and order cleanup
4. resolve the catalog build-time `cookies()` warning path
5. add refinement features (reviews, payouts, admin refunds)

---

## Immediate Context For New Sessions

A new AI session should assume:

- the search and catalog foundation already exists
- auth and role foundations already exist
- the authenticated cart foundation already exists
- checkout creates snapshot-backed pending orders
- Stripe webhook flow confirms payments server-side
- seller and admin operational surfaces now exist
- seller fulfillment and coupon-aware checkout now exist
- shopper-facing UX has been reset to feel like a real storefront
- seller onboarding now exists inside the app and no longer depends on manual SQL
- the repository now includes a real Supabase bootstrap chain
- new auth users should get app profiles automatically through DB triggers
- the first admin must be promoted explicitly by SQL
- the customer/visitor workflow blueprint exists at `docs/blueprint/01-customer-flow.md`
- address management is schema-defined but not yet implemented in the app

---

## Known Strategic Constraints

- avoid presenting unfinished features as complete
- avoid overcommitting to enterprise-scale architecture too early
- avoid mixing buyer, seller, and admin concerns without a clear role model
- avoid slipping back into developer/demo wording on user-facing screens
- avoid coupling historical order data to mutable live product data
- avoid weak status modeling for payments and orders
- avoid ad-hoc manual database setup outside the migration chain

---

## What A Good Next Change Looks Like

A strong next step should:

- build on the repaired database foundation
- deepen the role-separated product journeys
- preserve clean architecture
- be easy to explain in docs
- fit the roadmap
- not break the current migration chain

---

## Update Rule

Whenever major progress is made, update at least:

- `STATUS.md`
- `NEXT_STEPS.md`

Whenever architecture, behavior, or data modeling changes, also update:

- `DATABASE_SCHEMA.md`
- `DECISIONS.md`
- `README.md`
