# Next Steps

## Purpose

This file tracks the immediate next actions for the project.

It should stay short, practical, and current.
This is the execution list, not the long-term roadmap.

---

## Current Objective

Move from cart foundation into checkout groundwork.

---

## Immediate Next Tasks

### 1. Start checkout foundation

- define the server-side checkout validation flow
- load the authenticated cart from the repository layer
- revalidate product availability and quantities at checkout time
- define the provisional-to-final totals boundary clearly

### 2. Define pending-order creation strategy

- decide when the first durable order record should be created
- align order status and payment status defaults with the docs
- prepare snapshot fields for order items
- keep payment session creation deferred until checkout contracts are stable

### 3. Replace hand-written schema types with generated Supabase types

- generate database types from the real Supabase schema
- wire generated types into `src/lib/supabase/*` and repository helpers
- keep current auth/cart typing aligned while the schema evolves

### 4. Add test tooling when checkout rules exist

- add Vitest and React Testing Library when cart and checkout rules create meaningful coverage targets
- prioritize tests for cart mutation rules, checkout validation, and access-sensitive logic
- avoid adding empty scaffolding with no exercised business behavior

---

## First Build Sequence

### Step 1 - Checkout Foundation

Build:

- server-side cart revalidation
- provisional totals to final totals boundary
- checkout page contract
- clear error handling for invalid cart state

### Step 2 - Pending Order Groundwork

Build:

- pending order creation strategy
- order item snapshot contract
- order/payment status defaults
- retry-safe checkout initiation approach

### Step 3 - Payment Preparation

Build:

- payment provider integration plan in test mode
- payment session creation contract
- callback/webhook handling approach

---

## After That

### Commerce Core

- payment provider integration in test mode
- order persistence
- order items snapshot logic
- payment status + order status handling
- customer order history

### Marketplace Core

- seller onboarding submission UI
- seller dashboard shell
- seller product CRUD
- seller order view
- admin dashboard shell
- seller moderation
- product moderation
- coupon/category management

---

## Open Questions To Resolve During Implementation

- whether guest cart support should remain out of scope until after checkout is stable
- how much stock enforcement is needed before payment integration
- whether initial checkout should create pending orders immediately or create an order intent first
- when to add formal test tooling relative to the checkout and payment slices
- whether public catalog filters/search UI should return before orders are stable

---

## What Not To Do Next

Avoid doing these before the first commerce slice is stable:

- payment integration before checkout validation exists
- deep admin tooling
- advanced analytics
- payout automation
- recommendation engine
- complex notification system
- microservice refactor

---

## Working Rule

Only take one major implementation slice at a time.

Recommended order:

1. checkout
2. payments
3. orders
4. seller onboarding/dashboard
5. admin dashboard

---

## Update Rule

Update this file whenever:

- the current implementation slice changes
- a major task is completed
- new blockers appear
- priorities shift
