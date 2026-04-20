# Decisions

## Purpose

This file records important engineering and product decisions for the marketplace project.

It should stay concise.
Only record decisions that affect architecture, data modeling, workflow, or long-term implementation.

If a major decision changes later, update this file instead of silently drifting.

---

## D-001 — Project Direction

### Decision

The project will evolve from a search-first catalog application into a multi-vendor marketplace platform.

### Why

The current codebase already provides a strong foundation in:

- product discovery
- search
- autocomplete
- API integration
- database-backed catalog behavior

Expanding the project into a marketplace creates more portfolio value than keeping it as a simple search demo.

### Consequences

- future work will focus on commerce flows, roles, dashboards, and payments
- docs and implementation should treat the current app as a marketplace foundation, not a finished e-commerce system

---

## D-002 — Architecture Style

### Decision

The system will use a modular monolith architecture.

### Why

This approach is the best fit for:

- current project size
- portfolio value
- ease of iteration
- simpler deployment
- AI-assisted development

### Consequences

- one main application codebase
- one main database
- domain separation inside the codebase
- no premature microservices

---

## D-003 — Role Model

### Decision

The platform will start with three core roles:

- customer
- seller
- admin

### Why

These three roles cover the essential marketplace workflows without unnecessary complexity.

### Consequences

- customer flows, seller flows, and admin flows must remain clearly separated
- protected routes and APIs must enforce role access server-side

---

## D-004 — Seller Role vs Seller Status

### Decision

Seller role and seller approval status will be separate concepts.

### Why

A seller may exist in the seller flow but still be:

- pending
- approved
- rejected
- suspended

This is clearer than trying to encode everything in one field.

### Consequences

- seller access checks require:
  - authentication
  - seller role
  - seller profile
  - allowed seller status
- dashboard and product operations must check both role and status

---

## D-005 — Server-Side Business Validation

### Decision

Critical business rules will be enforced server-side, not only in the frontend.

### Why

Frontend checks are not sufficient for:

- security
- correctness
- ownership validation
- checkout safety

### Consequences

The server must validate:

- role access
- resource ownership
- coupon validity
- checkout totals
- product availability
- order transitions
- payment confirmation behavior

---

## D-006 — Order Status and Payment Status Separation

### Decision

Order status and payment status will be stored and managed separately.

### Why

These represent different lifecycles.

Examples:

- payment can be paid while order is still pending internal processing
- order can be cancelled after payment and later refunded
- partial refund should not collapse everything into one state

### Consequences

- schema must include separate fields
- API and architecture docs must keep these concepts distinct
- transition logic must be explicit

---

## D-007 — Order Snapshot Strategy

### Decision

Order items will store snapshot fields at purchase time.

### Why

Historical order data must remain accurate even if:

- product title changes
- price changes
- product is archived
- seller state changes later

### Consequences

`order_items` should snapshot important fields such as:

- product title
- product slug if useful
- unit price
- currency
- seller id
- selected metadata needed historically

---

## D-008 — Soft Delete / Archive Preference

### Decision

Historically meaningful records should prefer archive/suspend/soft-delete behavior instead of destructive deletion.

### Why

Marketplace systems need historical integrity.

### Consequences

Avoid hard delete for:

- products tied to orders
- sellers tied to orders
- orders
- order items
- payments
- audit records

Prefer archive/suspend for:

- products
- sellers
- categories
- coupons
- reviews if moderation is needed

---

## D-009 — Checkout Is Server-Authoritative

### Decision

Checkout totals and validation will be recalculated on the server.

### Why

The client cannot be trusted for final commerce correctness.

### Consequences

During checkout, the server must revalidate:

- cart items
- quantities
- product availability
- pricing
- coupon state
- final totals

---

## D-010 — Payment Provider Confirmation Is Authoritative

### Decision

Frontend redirect success alone will not be treated as final payment truth.

### Why

Client redirect can be incomplete, delayed, or misleading.

### Consequences

- payment confirmation must rely on verified provider-side events or trusted confirmation flow
- webhook or provider verification logic must be designed for safe retries
- UX can show pending confirmation where needed

---

## D-011 — Idempotency for Sensitive Flows

### Decision

Sensitive flows should be designed to tolerate retries and duplicate events.

### Why

Duplicate actions can happen from:

- double clicks
- browser refresh
- network retry
- provider webhook retries

### Consequences

Idempotency is especially important for:

- checkout initiation
- payment session creation
- webhook handling
- refund workflows later if added

---

## D-012 — Search-First Catalog Strategy

### Decision

Catalog and search will remain a first-class architectural area of the system.

### Why

The project already has a strong search foundation, and marketplace discovery is a high-value part of the product.

### Consequences

- search should stay index-aware
- autocomplete should remain lightweight
- listing and detail queries should stay separate
- fuzzy search should be monitored for performance as the dataset grows

---

## D-013 — Documentation-First Workflow

### Decision

The project will use documentation as part of implementation, not only as after-the-fact notes.

### Why

This project uses AI-assisted development and multi-session continuation.
Clear docs reduce confusion, repeated explanation, and bad architectural drift.

### Consequences

Before major implementation work, the team/project should keep these docs aligned:

- `PROJECT_OVERVIEW.md`
- `AI_CONTEXT.md`
- `ROADMAP.md`
- `FEATURE_SPEC.md`
- `DATABASE_SCHEMA.md`
- architecture docs
- `STATUS.md`
- `NEXT_STEPS.md`

---

## D-014 — MVP Scope Discipline

### Decision

The MVP will focus on realistic marketplace fundamentals, not enterprise complexity.

### Why

A smaller, correct, well-structured system is more valuable than a giant unfinished system.

### Consequences

Prioritize:

- product detail
- auth and roles
- cart
- checkout
- payment integration
- orders
- seller dashboard basics
- admin dashboard basics

Defer:

- advanced payout automation
- tax engine
- complex fraud systems
- microservices
- advanced recommendations

---

## D-015: Stripe Test-Mode Payment Transition Model

### Date

2026-04-20

### Decision

Payment status transitions for the MVP Stripe integration follow a server-authoritative model:

| Event | `payments.status` | `orders.payment_status` | `orders.order_status` |
|---|---|---|---|
| Pending order created | _(no row)_ | `unpaid` | `pending` |
| Stripe session created | `processing` | `unpaid` | `pending` |
| Webhook: `checkout.session.completed` | `paid` | `paid` | `confirmed` |
| Webhook: `checkout.session.expired` | `failed` | `failed` | `pending` |

### Why

- Only the Stripe webhook (server-side) transitions to `paid`/`confirmed`. Client-side redirect is for UX only.
- Webhook handling is idempotent. A payment already in a terminal state (`paid`, `refunded`, `partially_refunded`) won't be re-processed.
- Cart is cleared immediately after pending-order creation (before payment) per Phase 5 behavior. This avoids complexity around cart-recovery if payment fails, at the cost of needing a fresh cart if the user cancels. Acceptable for MVP.
- An existing `processing` payment record with a still-open Stripe session is reused to prevent duplicate Stripe sessions for the same order.
- Stripe env vars are optional: when not configured, checkout falls back to Phase 5 behavior (redirect to order detail with pending/unpaid status).

### Consequences

- Failed payments leave the order in `pending`/`failed` state. The customer can retry from the order detail page.
- Refund and partial-refund status values exist in the schema but are not exercised until a future refund workflow phase.
- The webhook endpoint requires HTTPS in production and Stripe CLI for local development testing.

---

## D-016: Seller Dashboard Ownership and Status Model

### Date

2026-04-20

### Decision

Seller dashboard access follows a four-layer authorization model:

1. **Authenticated user** — must be signed in
2. **Seller role** — `profile.role === "seller"` (enforced at layout level)
3. **Seller profile exists** — a `seller_profiles` record must exist
4. **Approved status** — `seller_profile.status === "approved"` (enforced per-page for mutations)

Ownership enforcement:

- Every seller repository function takes `sellerProfileId` as its first argument
- `sellerProfileId` is derived from the authenticated session, never from client input
- All product queries filter by `seller_id = sellerProfileId`
- Sellers cannot access, view, or modify other sellers' data

Product lifecycle rules for sellers:

| Action | Allowed statuses | Result status |
|---|---|---|
| Create | — | `draft` or `active` |
| Publish | `draft` | `active` |
| Archive | `draft`, `active` | `archived` |
| Suspend | (admin only) | `suspended` |

Seller order visibility:

- Sellers see only their own `order_items` rows
- Parent order status/payment data is joined via a second query
- Other sellers' line items from multi-vendor orders are never exposed

### Why

- Server-authoritative ownership prevents cross-seller data leakage
- Status gating at layout level prevents pending/suspended sellers from accessing operational features
- Product lifecycle rules align with FEATURE_SPEC.md and DATABASE_SCHEMA.md
- Two-query approach for order data works around missing Relationships metadata in hand-written Database types

### Consequences

- Sellers must be created/approved via database seed or admin tools until seller onboarding UI is built
- Hand-written Database types prevent Supabase join syntax — requires two-query workarounds
- Category selection in seller product form uses raw UUID input until category management is available

---

## Update Rule

Add a new decision when:

- architecture changes
- schema rules change
- access model changes
- checkout/payment logic changes
- a tradeoff is intentionally chosen and should not be rediscovered later
