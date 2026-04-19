# Next Steps

## Purpose

This file tracks the immediate next actions for the project.

It should stay short, practical, and current.
This is the execution list, not the long-term roadmap.

---

## Current Objective

Move from repository bootstrap into the first marketplace implementation slice.

---

## Immediate Next Tasks

### 1. Reconcile phase naming in planning docs

- current implementation completed a bootstrap baseline
- roadmap still labels product detail/catalog hardening as Phase 1
- decide whether to renumber the roadmap or treat bootstrap as Phase 0.5

### 2. Build the product detail slice

- define route shape
- implement server-side visibility rules
- add detail query path
- replace homepage-only placeholder behavior with a real product detail flow

### 3. Start auth and role groundwork

- connect Supabase auth
- create profile synchronization approach
- define role loading strategy
- prepare protected route patterns for future seller/admin areas

### 4. Replace placeholder database types

- generate Supabase database types once schema work starts
- wire generated types into `src/lib/supabase/*`

### 5. Decide whether to add test tooling in the next slice

- add Vitest and React Testing Library when the first real business logic arrives
- avoid adding empty test scaffolding with no meaningful coverage target

---

## First Build Sequence

### Step 1 - Product Detail Page

Build:

- product detail route
- product detail query
- public visibility checks
- product detail UI
- related products section if simple enough

### Step 2 - Auth Foundation

Build:

- sign in / sign up flow
- session-aware server checks
- profile creation or synchronization
- role loading
- protected route foundation

### Step 3 - Seller/Profile Foundations

Build:

- seller profile model
- seller status handling
- server-side role/status checks

### Step 4 - Cart Foundation

Build:

- cart data model
- add/remove/update cart behavior
- cart read endpoint
- basic cart UI

### Step 5 - Checkout Foundation

Build:

- server-side cart validation
- coupon validation rules
- pending order creation strategy
- checkout endpoint contract

---

## After That

### Commerce Core

- payment provider integration in test mode
- order persistence
- order items snapshot logic
- payment status + order status handling
- customer order history

### Marketplace Core

- seller dashboard shell
- seller product CRUD
- seller order view
- admin dashboard shell
- seller moderation
- product moderation
- coupon/category management

---

## Open Questions To Resolve During Implementation

- exact slug strategy for product detail pages
- whether seller approval is mandatory before any product creation or only before publishing
- how much stock logic is needed in MVP
- whether cart requires guest-cart support now or later
- whether initial checkout should create pending orders immediately or create an order intent first
- when to add formal test tooling relative to the first product-detail and auth slice

---

## What Not To Do Next

Avoid doing these before the first commerce slice is stable:

- fake seller/admin shell pages with no protected routing
- advanced analytics
- payout automation
- recommendation engine
- deep admin tooling
- complex notification system
- microservice refactor

---

## Working Rule

Only take one major implementation slice at a time.

Recommended order:

1. product detail
2. auth + roles
3. cart
4. checkout
5. payments
6. orders
7. seller dashboard
8. admin dashboard

---

## Update Rule

Update this file whenever:

- the current implementation slice changes
- a major task is completed
- new blockers appear
- priorities shift
