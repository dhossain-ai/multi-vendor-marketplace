# Roadmap

## Purpose

This roadmap defines the phased implementation plan for evolving the current catalog/search application into a realistic multi-vendor marketplace platform.

It is intentionally structured to prioritize:

1. clear product behavior
2. strong data modeling
3. reliable core commerce flows
4. role-based marketplace features
5. production-minded hardening

The roadmap should be updated as scope changes, but phase order should remain deliberate unless a documented decision explains why it changed.

---

## Current Status

The project currently has a strong **catalog, auth, cart, and checkout foundation**:

- Next.js frontend
- Supabase/PostgreSQL data layer
- public catalog browsing
- authenticated cart flow
- pending-order creation
- snapshot-backed customer order history foundation

The next work should build on this foundation instead of replacing it.

---

## Guiding Delivery Strategy

Build the product in vertical slices, not isolated UI fragments.

Each phase should aim to deliver a coherent capability that could exist in a real product.

Examples:

- search and discovery
- product details and product validity
- checkout and pending order creation
- payment integration
- seller product operations
- admin platform controls

---

# Phase 0 — Documentation and Domain Lockdown

## Goal

Establish clear product rules, data modeling direction, and technical constraints before major marketplace features are added.

## Deliverables

- complete `PROJECT_OVERVIEW.md`
- complete `AI_CONTEXT.md`
- complete `ROADMAP.md`
- draft `FEATURE_SPEC.md`
- draft `DATABASE_SCHEMA.md`
- draft `API_SPEC.md`
- draft `ARCHITECTURE.md`
- draft `DECISIONS.md`

## Exit Criteria

- product roles are defined
- initial order/payment status model is defined
- seller/customer/admin boundaries are clear
- checkout and order assumptions are documented
- core schema direction is stable enough to start implementation

---

# Phase 1 — Repository Bootstrap and Baseline Setup

## Goal

Establish a clean application baseline before business features are added.

## Scope

- initialize the Next.js App Router application
- configure TypeScript and Tailwind CSS
- add ESLint and Prettier
- define scalable `src/` folder boundaries
- add minimal app shell and shared utilities
- scaffold Supabase clients and environment setup
- update README and project status docs

## Deliverables

- running Next.js app
- shared layout shell
- repository tooling and formatting
- Supabase scaffolding
- updated onboarding docs

## Exit Criteria

- repo builds cleanly
- baseline architecture is in place for domain slices
- future catalog, auth, and commerce work can build on the same structure

---

# Phase 2 — Product Detail and Catalog Hardening

## Goal

Evolve the current listing experience into a more realistic storefront discovery layer.

## Scope

- product details page
- route by slug or stable identifier
- richer product metadata
- related products
- improved filter/sort/pagination behavior
- better empty/loading/error states
- product status rules (active/draft/archived)
- category structure improvements if needed

## Deliverables

- product detail page UI
- server-backed product detail fetch
- stable product identity and slug handling
- list/detail consistency between UI and database
- docs updated to reflect product/catalog behavior

## Exit Criteria

- users can browse search results and land on a product detail page
- product detail state is reliable and documented
- catalog behavior is realistic enough to support commerce flows

---

# Phase 3 — Authentication and Role Foundation

## Goal

Introduce identity and role boundaries needed for marketplace workflows.

## Scope

- authentication
- user profiles
- role model
- protected routes and server-side authorization scaffolding
- customer/seller/admin role separation
- initial seller onboarding approach

## Deliverables

- auth integration
- user table/profile model
- role-aware access enforcement
- route protection patterns
- seller onboarding/application model defined or implemented minimally

## Exit Criteria

- users can authenticate
- role checks exist server-side
- protected areas are structured for later seller/admin features
- unauthorized access paths are blocked correctly

---

# Phase 4 — Cart Foundation

## Goal

Implement the authenticated customer cart and prepare the app for checkout work.

## Scope

- cart management
- quantity updates
- server-side cart validation basics
- protected cart page
- add-to-cart flow from product detail
- provisional cart summary behavior

## Deliverables

- add/remove/update cart flows
- cart summary UI
- server-scoped cart ownership enforcement
- docs updated for cart behavior

## Exit Criteria

- a signed-in user can build and manage a cart
- cart reads and writes are scoped server-side
- cart totals are clearly marked as provisional

---

# Phase 5 — Checkout and Pending Order Flow

## Goal

Convert a validated cart into a snapshot-backed pending order without adding real payment integration yet.

## Scope

- checkout page
- server-side cart revalidation
- server-side totals calculation
- pending-order creation strategy
- order item snapshot persistence
- customer order history foundation
- payment schema preparation if useful for the next phase

## Deliverables

- checkout validation flow
- pending order creation
- `orders` and `order_items` schema support
- customer order list/detail foundation
- docs updated to reflect checkout and order behavior

## Exit Criteria

- a signed-in user can move from cart to a pending order
- totals are calculated server-side
- order history reads from snapshot-backed records
- invalid cart states are handled safely

---

# Phase 6 — Payment Integration and Order Lifecycle

## Goal

Turn pending checkout into a transaction-aware payment flow.

## Scope

- payment provider integration in test mode
- payment session creation
- payment confirmation handling
- webhook or callback strategy
- payment records
- order status and payment status transition handling

## Deliverables

- payment session integration
- webhook or callback handling design/implementation
- `payments` schema usage
- customer payment-aware order follow-up UX
- status transitions documented and enforced

## Exit Criteria

- a customer can complete a realistic end-to-end purchase flow
- payments persist safely
- payment and order states are modeled separately
- duplicate or retried payment events are accounted for in design

---

# Phase 7 — Seller Dashboard and Vendor Workflows

## Goal

Introduce the seller-facing side of the marketplace.

## Scope

- seller dashboard shell
- seller product CRUD
- seller product status management
- seller order visibility
- seller earnings summary
- seller-specific permissions
- vendor application and approval flow, if not done earlier

## Deliverables

- seller dashboard routes/pages
- seller product management flows
- seller order list
- seller analytics summary (basic)
- seller data isolation rules documented and enforced

## Exit Criteria

- a seller can manage their own products
- a seller can view only their own relevant orders and sales data
- seller-facing flows feel like a real marketplace system

---

# Phase 8 — Admin Dashboard and Platform Controls

## Goal

Introduce platform-level operational controls.

## Scope

- admin dashboard overview
- vendor approval/rejection
- product moderation/management
- category management
- coupon management
- order monitoring
- platform revenue/commission visibility
- basic admin audit considerations

## Deliverables

- admin-only routes/pages
- dashboard metrics cards
- vendor management flows
- order monitoring tools
- coupon/category management
- documentation for admin authority boundaries

## Exit Criteria

- admin can operate core marketplace controls
- admin actions are clearly separated from seller abilities
- platform oversight is visible and useful

---

# Phase 9 — Marketplace Refinement Features

## Goal

Add features that improve realism and buyer/seller experience after the core flows are stable.

## Scope

- wishlist
- product reviews/ratings
- seller profile pages
- discount campaigns
- richer analytics
- notifications
- invoice download
- better account/profile management

## Deliverables

- selected refinement features implemented with clear priority
- docs updated to reflect final behavior
- UX quality improvements across buyer/seller/admin surfaces

## Exit Criteria

- the product feels substantially more complete as a marketplace
- secondary features do not compromise core reliability
- portfolio presentation value increases meaningfully

---

# Phase 10 — Reliability, Performance, and Production Hardening

## Goal

Strengthen the system for realistic usage patterns and better engineering credibility.

## Scope

- index review and query tuning
- pagination and search performance review
- rate limiting strategy
- retry/idempotency review for sensitive endpoints
- logging/observability improvements
- admin audit trail strategy
- error handling hardening
- caching candidates review
- background job candidates review

## Deliverables

- documented scaling considerations
- performance-oriented schema/index updates
- hardened mutation paths
- documented failure/retry behavior
- improved operational visibility

## Exit Criteria

- the system has a credible growth path
- the docs clearly explain performance and reliability decisions
- core workflows are more resilient to concurrency and failure scenarios

---

# Phase 11 — Portfolio and Presentation Hardening

## Goal

Prepare the project to be presented as a polished, serious marketplace case study.

## Scope

- improve seed/demo data realism
- tighten UI consistency
- add screenshots or demo artifacts
- ensure docs accurately reflect current capabilities
- clean up dead code and unfinished experiments
- improve developer onboarding experience

## Deliverables

- portfolio-ready repo presentation
- accurate README and docs alignment
- cleaned project structure
- stronger narrative of technical and product decisions

## Exit Criteria

- the project can be shown confidently as a full-stack marketplace platform
- reviewers can understand what is built, how it works, and how it was designed
- docs and implementation tell the same story

---

## Cross-Cutting Engineering Work

These items may happen across multiple phases and should not be ignored:

- test coverage for critical logic
- schema and migration hygiene
- documentation updates
- refactoring where complexity grows
- consistency of naming and domain language
- security and validation review
- accessibility and UX polish where relevant

---

## Milestone View

### Milestone A — Catalog Foundation

Complete when:

- search
- listing
- detail pages
- stable product model

### Milestone B — Commerce Core

Complete when:

- auth
- cart
- checkout
- payment integration
- order lifecycle

### Milestone C — Marketplace Core

Complete when:

- seller dashboard
- admin dashboard
- vendor/product/order platform controls

### Milestone D — Production-Minded Platform

Complete when:

- reliability hardening
- performance review
- portfolio presentation quality

---

## Priority Rules

When choosing what to build next, follow these rules:

1. documentation and domain clarity before major architecture changes
2. core purchase flow before secondary polish
3. role safety before dashboard feature depth
4. correctness before convenience
5. realistic scope before unnecessary complexity

---

## What Not To Do

Avoid these mistakes:

- building too many UI pages before product rules are defined
- adding seller/admin dashboards before auth/role boundaries are stable
- adding payment UI without modeling order/payment states properly
- relying on live product data to represent historical orders
- prioritizing fancy features over core reliability

---

## Roadmap Maintenance Rule

Update this roadmap when:

- a phase is completed
- scope is removed or added significantly
- architectural assumptions change
- priorities shift for a documented reason
