# Architecture Overview

## Purpose

This document is the top-level architecture entry point for the project.

It explains:

- what kind of system this is
- how the major parts fit together
- where core business logic should live
- how request/data flow should work
- which deeper architecture docs to read next

This file should stay concise. Detailed design belongs in the other files under `docs/architecture/`.

---

## System Summary

This project is a full-stack marketplace platform built on top of an existing search and catalog foundation.

The current direction is a **modular monolith**:

- one primary application codebase
- one primary database
- clear internal boundaries between product areas
- scalable enough for realistic growth without premature microservice complexity

The product is expected to support three major surfaces:

- customer
- seller
- admin

---

## Architecture Goals

### Primary Goals

- keep the codebase easy to extend
- preserve clean separation between UI, API, business logic, and data access
- support realistic marketplace workflows
- protect correctness in checkout, orders, and payments
- make AI-assisted development safer through clear documentation

### Non-Goals

At this stage, the architecture does **not** aim to provide:

- microservices
- distributed event buses
- advanced multi-region infrastructure
- enterprise-grade payout automation
- overly abstract domain frameworks

The goal is strong, realistic architecture with clear upgrade paths.

---

## High-Level System Model

### Main Layers

The system should be thought of in these layers:

1. **UI Layer**
   - pages
   - layouts
   - presentational components
   - client interactions

2. **API / Route Layer**
   - request parsing
   - auth/session validation
   - input validation
   - orchestration of business operations
   - response formatting

3. **Domain / Business Logic Layer**
   - marketplace rules
   - checkout rules
   - coupon validation
   - order state transitions
   - role/ownership rules

4. **Data Access Layer**
   - repository functions
   - database queries
   - RPC calls
   - persistence coordination

5. **Database Layer**
   - PostgreSQL schema
   - constraints
   - indexes
   - durable records
   - historical snapshots

---

## Technology Stack

### Frontend

- Next.js App Router
- TypeScript
- Tailwind CSS

### Backend / Data

- Next.js server routes
- Supabase
- PostgreSQL
- Supabase RPC where appropriate

### Quality / Tooling

- ESLint
- Prettier
- Vitest
- React Testing Library

### Deployment

- Vercel

---

## Architectural Style

## Modular Monolith

This project should remain a modular monolith unless a real need proves otherwise.

That means:

- one deployable application
- one main database
- clearly separated modules inside the codebase
- no fake service boundaries unless they add real value

### Why This Style Fits

This architecture is appropriate because:

- it is simpler to build and reason about
- it fits a portfolio-grade product well
- it avoids premature infrastructure complexity
- it still supports good engineering discipline if module boundaries are clear

---

## Core Product Domains

### 1. Catalog and Discovery

Responsible for:

- product listing
- search
- autocomplete
- filtering
- sorting
- product detail pages
- category navigation

### 2. Identity and Roles

Responsible for:

- authentication
- user profile data
- role assignment
- seller approval status
- admin access boundaries

### 3. Cart and Checkout

Responsible for:

- cart state
- quantity changes
- coupon application
- checkout preparation
- server-side total recalculation

### 4. Orders and Payments

Responsible for:

- order creation
- order item snapshots
- payment session creation
- payment confirmation
- payment/order status transitions
- refund-aware historical integrity

### 5. Seller Operations

Responsible for:

- seller dashboard
- seller-owned product CRUD
- seller order visibility
- seller sales and earnings summaries

### 6. Admin Operations

Responsible for:

- seller moderation
- product moderation
- coupon/category management
- order monitoring
- platform-level summaries
- audit-sensitive actions

---

## Request Flow

## General Request Flow

Most requests should follow this pattern:

**UI → API Route → Domain Logic → Repository/Data Access → Database**

### Responsibilities by Step

- **UI** collects user action and displays result
- **API Route** authenticates, validates, and delegates
- **Domain Logic** applies business rules
- **Repository Layer** reads/writes persistence data
- **Database** enforces structural integrity

### Important Rule

Business rules should not live only in UI components.

Examples:

- coupon validity
- checkout total calculation
- seller ownership checks
- admin permissions
- order state transitions

These must be enforced server-side.

---

## Read vs Write Paths

## Read-Heavy Paths

These paths should be optimized for speed and simplicity:

- product listing
- product detail
- search
- autocomplete
- public catalog browsing
- seller/admin summary reads where possible

## Write-Sensitive Paths

These paths require stronger protection:

- product creation/editing
- cart mutation
- checkout
- payment state updates
- order creation
- seller approval
- admin moderation actions

### Write Path Rules

Write endpoints should emphasize:

- validation
- authorization
- idempotency where needed
- correctness over convenience

---

## Data Ownership Model

## Customer-Owned Data

Customers should only access:

- their own profile
- their own addresses
- their own cart
- their own orders
- their own wishlist
- their own review rights

## Seller-Owned Data

Sellers should only access:

- their own seller profile
- their own products
- their own seller-facing order views
- their own earnings/summary data

## Admin Scope

Admins can access platform-wide operational views and controls, but sensitive changes should be deliberate and auditable.

### Ownership Principle

Never trust route visibility or frontend conditions alone. Ownership checks must be enforced in server-side code.

---

## Historical Correctness Model

## Core Principle

Historical order data must remain correct even if live product data changes later.

This affects:

- product title changes
- price changes
- seller updates
- category changes
- product archival
- seller suspension

## Practical Rule

Orders and order items must store snapshot data needed for future correctness.

Examples:

- product title at time of purchase
- unit price at time of purchase
- seller id at time of purchase
- selected product metadata needed historically

---

## Order and Payment State Model

## Required Separation

Order status and payment status must be separate concepts.

### Order Status

Represents fulfillment/business lifecycle.

Examples:

- pending
- confirmed
- processing
- completed
- cancelled
- refunded

### Payment Status

Represents money/payment lifecycle.

Examples:

- unpaid
- processing
- paid
- failed
- refunded

### Why This Matters

A payment can succeed while an order update fails, or an order can be cancelled after payment due to business logic. Combining both into one field makes the system harder to reason about and less correct.

---

## Reliability Principles

## 1. Idempotency

Critical flows must tolerate retries and duplicate requests where practical.

Most important examples:

- checkout initiation
- payment webhook processing
- refund handling later if added

## 2. Server-Side Validation

Never trust:

- client totals
- client coupon validity
- client role assumptions
- client ownership assumptions

## 3. Safe Status Transitions

Order and payment state changes should follow explicit allowed transitions.

## 4. Soft Delete Where History Matters

Avoid destructive deletion for:

- products with historical orders
- sellers with historical orders
- coupons used historically
- order and payment records

---

## Search and Catalog Architecture

## Current Direction

Search remains an important foundation of this system.

Current design includes:

- list/search endpoint
- autocomplete/typeahead
- fuzzy search strategy
- database-assisted search logic

## Architectural Goal

Keep catalog reads efficient and scalable without mixing too much business logic into the listing/search path.

### Rules

- search endpoints should remain read-optimized
- listing queries should be index-aware
- fuzzy search must be monitored for cost as dataset grows
- autocomplete must be limited and rate-aware

More details belong in:

- `catalog-and-search.md`

---

## Checkout and Payment Architecture

## Guiding Principle

Checkout is one of the highest-risk parts of the system and must be treated as a sensitive server-side flow.

### Checkout Responsibilities

- validate authenticated user
- load current cart state
- revalidate product availability
- revalidate coupon
- recalculate totals server-side
- create pending order/order intent
- create payment session
- persist payment-related tracking identifiers

### Payment Responsibilities

- receive provider callback/webhook
- verify authenticity
- update payment status safely
- transition order state if appropriate
- avoid duplicate side effects

More details belong in:

- `checkout-and-payments.md`

---

## Security and Access Strategy

## Security Principles

- authentication is required for protected endpoints
- authorization is enforced server-side
- seller access is ownership-scoped
- admin access is explicit
- sensitive actions should be logged or auditable where possible

## Supabase / Database Access

If Row Level Security is used, it should support ownership boundaries, but application-level checks must still be explicit for business correctness.

---

## Performance and Scaling Strategy

## Near-Term Approach

Design for realistic growth without overengineering.

### Focus Areas

- index hot query paths
- paginate large lists
- keep listing reads simple
- keep checkout/order/payment writes correct
- avoid expensive joins on high-traffic endpoints unless necessary

## Future Upgrade Paths

If traffic grows significantly, likely improvements include:

- better search/index tuning
- caching selected read-heavy paths
- background jobs for notifications/reporting
- better observability and monitoring
- selective denormalization for read-heavy views

### Important Principle

Design for upgradeability now, not maximum infrastructure complexity now.

---

## Code Organization Direction

## Desired Separation

The codebase should move toward clear domain-based organization.

### Example Structure

- UI components should focus on rendering and interaction
- routes should handle request/response concerns
- repository modules should manage persistence concerns
- domain logic should encode business rules

### Avoid

- business logic buried in page components
- raw DB logic duplicated across many routes
- mixed customer/seller/admin logic without boundaries
- silently inconsistent naming between code and docs

---

## Documentation Map

This file is only the overview. Read more specific files as needed:

- `architecture/auth-and-roles.md`
  - auth model
  - session handling
  - role and ownership boundaries

- `architecture/catalog-and-search.md`
  - listing flow
  - search flow
  - autocomplete strategy
  - catalog performance considerations

- `architecture/checkout-and-payments.md`
  - cart flow
  - checkout flow
  - payment integration
  - webhook handling
  - idempotency

- `architecture/seller-and-admin-flows.md`
  - seller dashboard architecture
  - admin dashboard architecture
  - moderation and operational boundaries

- `architecture/scaling-and-reliability.md`
  - indexing
  - caching candidates
  - retry behavior
  - concurrency concerns
  - future hardening path

---

## Source of Truth Order

When architecture questions come up, resolve in this order:

1. `FEATURE_SPEC.md`
2. `DATABASE_SCHEMA.md`
3. `DECISIONS.md`
4. architecture files
5. implementation

If implementation intentionally changes the architecture, the relevant docs must be updated.

---

## Current Architectural Priorities

The next major architectural focus should be:

1. finalize product rules
2. finalize schema direction
3. add product detail flow
4. add auth and role boundaries
5. add cart and checkout architecture
6. add payment-aware order lifecycle
7. add seller/admin operational layers
8. harden reliability and scaling paths

---

## Guiding Principle

Keep the system simple at the infrastructure level and serious at the domain level.

That means:

- simple deployment
- strong data modeling
- clear ownership rules
- reliable checkout/payment logic
- well-documented architecture
