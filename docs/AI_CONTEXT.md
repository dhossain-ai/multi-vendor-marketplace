# AI Context

## Purpose

This file is the primary handoff document for new AI chats/models working on this repository. It provides the minimum accurate context needed to continue work safely and consistently without re-discovering the project from scratch.

This file should be updated whenever the project direction, architecture, priorities, or major implementation status changes.

---

## Project Mission

This repository is evolving from a game search/catalog application into a full-stack multi-vendor marketplace platform.

The current application already provides:

- catalog/listing UI
- search API
- autocomplete/typeahead
- fuzzy search using PostgreSQL `pg_trgm`
- Supabase-backed data layer
- test and deployment setup

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
- lint/typecheck/build verification

### Not Yet Implemented

- authentication
- cart
- checkout flow
- payment provider integration
- order persistence and lifecycle
- seller dashboard
- admin dashboard
- commission logic
- coupon system
- reviews
- wishlist
- notification workflows
- audit logging

---

## Current Product Positioning

Treat the project as a **catalog/discovery foundation with a public product slice** that will become a marketplace platform.

Do **not** describe the current implementation as a full e-commerce product yet.

Acceptable descriptions:

- search-driven marketplace foundation
- product catalog and discovery platform
- marketplace-ready full-stack base
- catalog/search app being expanded into a multi-vendor marketplace

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
- Supabase RPC for fuzzy search
- repository/data access layer

### Tooling

- ESLint
- Prettier
- Vitest
- React Testing Library

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
- coupon validation
- checkout totals
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
2. add product details page
3. add authentication and role model
4. add cart and checkout flow
5. integrate payment provider in test mode
6. add order persistence and status model
7. build seller dashboard foundation
8. build admin dashboard foundation
9. add coupon, review, wishlist, and reporting layers
10. harden for reliability and scaling

---

## Immediate Context for New Sessions

A new AI session should assume:

- the search and catalog foundation already exists
- the project is transitioning to marketplace architecture
- documentation-first planning is part of the workflow
- schema design, role boundaries, and checkout rules matter more than adding random UI features
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
- not break the existing search foundation
- add meaningful portfolio value

Examples:

- auth/role scaffolding
- cart state and checkout prep
- order schema planning
- seller/admin dashboard shell

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
