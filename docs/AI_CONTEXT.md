# AI Context

## Purpose

This file is the primary handoff document for new AI chats/models working on this repository. It provides the minimum accurate context needed to continue work safely and consistently without re-discovering the project from scratch.

This file should be updated whenever the project direction, architecture, priorities, or major implementation status changes.

---

## Project Mission

This repository is a production-minded full-stack multi-vendor marketplace platform under active phased implementation.

The current application already provides:

- public catalog/listing UI
- product detail pages by slug
- Supabase-backed catalog, auth, and cart scaffolding
- server-side auth/session/profile loading
- protected route foundations for account, seller, admin, and cart access
- build, lint, and typecheck verification

The goal is to expand it into a realistic commerce system with:

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
- sign-in, sign-up, sign-out, and auth callback flow
- server-side session/profile/seller-profile loading
- role-aware route guard utilities
- minimal authenticated account UI and protected seller/admin placeholders
- cart migration and typed cart schema support
- server-side cart repository and mutation actions
- protected `/cart` page and add-to-cart flow from product detail
- header cart item count and provisional cart summary behavior
- lint/typecheck/build verification

### Not Yet Implemented

- checkout flow
- payment provider integration
- order persistence and lifecycle
- seller onboarding submission UI
- seller dashboard features
- admin dashboard features
- commission logic
- coupon system
- reviews
- wishlist
- notification workflows
- audit logging

---

## Current Product Positioning

Treat the project as a **catalog, auth, and cart foundation** that will become a full marketplace platform.

Do **not** describe the current implementation as a full e-commerce product yet.

Acceptable descriptions:

- product catalog and customer account foundation
- marketplace-ready full-stack base
- phased multi-vendor marketplace implementation

Avoid overstating current scope.

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

### Deployment

- Vercel

---

## Architecture Direction

The intended architecture is a modular monolith suitable for a portfolio-grade product and future scaling.

Preferred structure:

- UI components isolated from domain logic
- API routes handling request validation and orchestration
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
- cart and checkout totals
- stock/availability checks
- order creation
- payment confirmation handling

### 2. Preserve historical correctness

Order data must not depend on mutable product records after purchase. Use order snapshots for titles/prices relevant to completed orders.

### 3. Separate payment state from order state

Do not collapse everything into a single status field.

Examples:

- `payment_status`: unpaid, processing, paid, failed, refunded
- `order_status`: pending, confirmed, completed, cancelled, refunded

### 4. Prefer idempotent write paths

Checkout, payment callbacks/webhooks, and other sensitive mutations must be designed to tolerate retries and duplicate requests.

### 5. Design for realistic scaling, not premature overengineering

The project should be schema-safe and architecture-aware for future growth, but it does not need enterprise complexity in the first version.

### 6. Keep docs aligned with code

When the implementation changes meaningfully, update the relevant docs:

- `STATUS.md`
- `NEXT_STEPS.md`
- `DEV_SUMMARY.md`
- `ARCHITECTURE.md`
- `FEATURE_SPEC.md`
- `DATABASE_SCHEMA.md`
- `API_SPEC.md`
- `DECISIONS.md`

---

## Product Rules to Preserve

These rules should shape future implementation:

- role enforcement must be server-side
- cart ownership and mutation checks must be server-side
- seller data access must be isolated to seller-owned resources
- admin capabilities must be explicit and auditable
- order totals must be revalidated server-side at checkout
- coupons must be validated server-side
- payment success from client-side redirect alone is not enough for final order completion
- important mutations should be resistant to duplicate submissions
- old orders must remain readable even if product data changes later

---

## Current Documentation Map

Use these files as the source of truth for specific concerns:

- `PROJECT_OVERVIEW.md` — product and engineering summary
- `ROADMAP.md` — phased plan and sequencing
- `FEATURE_SPEC.md` — business behavior and edge cases
- `DATABASE_SCHEMA.md` — schema design and constraints
- `API_SPEC.md` — endpoint contracts and mutation behavior
- `ARCHITECTURE.md` — request flow, auth strategy, scaling notes
- `DECISIONS.md` — rationale for important choices
- `STATUS.md` — current live progress
- `NEXT_STEPS.md` — immediate next work
- `DEV_SUMMARY.md` — historical progression
- `AI_PROMPT_HISTORY.md` — prompt history and AI workflow notes

---

## Coding Preferences

When extending the codebase:

- prefer clear and explicit code over clever abstractions
- keep domain logic out of presentation-heavy components
- prefer typed interfaces and predictable data shapes
- keep naming business-oriented and consistent
- do not bypass repository or server-side validation for convenience
- add or update tests where meaningful
- document new architecture or behavior changes in docs

---

## Current Priority Order

The next major work should generally follow this order:

1. lock down product rules and documentation
2. add checkout flow
3. integrate payment provider in test mode
4. add order persistence and status model
5. build seller onboarding and seller dashboard foundation
6. build admin dashboard foundation
7. add coupon, review, wishlist, and reporting layers
8. harden for reliability and scaling

---

## Immediate Context for New Sessions

A new AI session should assume:

- the search and catalog foundation already exists
- auth and role foundations already exist
- the authenticated cart foundation already exists
- the project is transitioning to marketplace architecture
- documentation-first planning is part of the workflow
- schema design, role boundaries, checkout rules, and historical correctness matter more than adding random UI features
- the implementation should stay realistic and portfolio-grade
- decisions should favor future maintainability and real-world behavior

---

## Known Strategic Constraints

- avoid presenting unfinished features as complete
- avoid overcommitting to enterprise-scale architecture too early
- avoid mixing buyer, seller, and admin concerns without a clear role model
- avoid coupling historical order data to mutable live product data
- avoid weak status modeling for payments and orders

---

## What a Good Next Change Looks Like

A strong next step should:

- improve realism of the marketplace
- preserve clean architecture
- be easy to explain in docs
- fit the roadmap
- not break the existing foundation
- add meaningful portfolio value

Examples:

- checkout validation and totals revalidation
- order schema planning
- seller/admin dashboard shell after commerce foundations are in place

---

## Update Rule

Whenever major progress is made, update at least:

- `STATUS.md`
- `NEXT_STEPS.md`

Whenever architecture, behavior, or data modeling changes, also update:

- `ARCHITECTURE.md`
- `FEATURE_SPEC.md`
- `DATABASE_SCHEMA.md`
- `API_SPEC.md`
- `DECISIONS.md`
