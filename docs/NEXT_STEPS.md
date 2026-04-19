# Next Steps

## Purpose

This file tracks the immediate next actions for the project.

It should stay short, practical, and current.
This is the execution list, not the long-term roadmap.

---

## Current Objective

Move from checkout and pending-order groundwork into payment integration.

---

## Immediate Next Tasks

### 1. Start payment integration groundwork

- choose the first payment provider in test mode
- create payment session creation flow attached to pending orders
- persist payment tracking identifiers safely
- keep payment creation server-authoritative

### 2. Add payment status handling

- create payment records for pending orders
- keep payment status separate from order status
- define initial transition rules for payment success and failure
- prepare idempotent attachment points for callbacks or webhooks

### 3. Replace hand-written schema types with generated Supabase types

- generate database types from the real Supabase schema
- wire generated types into `src/lib/supabase/*` and repository helpers
- keep current auth/cart/checkout typing aligned while the schema evolves

### 4. Add test tooling when payment-sensitive logic exists

- add Vitest and React Testing Library when checkout and payment rules create meaningful coverage targets
- prioritize tests for checkout validation, pending-order creation, and payment status transitions
- avoid adding empty scaffolding with no exercised business behavior

---

## First Build Sequence

### Step 1 - Payment Session Foundation

Build:

- payment record creation
- payment session request contract
- pending order to payment attachment flow
- safe redirect target planning

### Step 2 - Payment Confirmation Foundation

Build:

- provider callback or webhook contract
- payment status updates
- initial order status transitions after payment confirmation
- duplicate-event protection strategy

### Step 3 - Customer Order Follow-Through

Build:

- order detail updates after payment state changes
- customer-facing payment state messaging
- retry-safe handling for failed or abandoned payment attempts

---

## After That

### Commerce Core

- payment provider integration in test mode
- richer order persistence and lifecycle handling
- payment status + order status transitions
- customer order follow-up UX
- coupon groundwork if it supports checkout

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

- whether payment records should be created before or during provider session creation
- what the first idempotency strategy should be for payment session creation
- whether cart-clearing behavior needs additional recovery handling if payment session creation fails later
- when to add formal test tooling relative to the payment and order-status slices
- whether public catalog filters/search UI should return before payment and orders are stable

---

## What Not To Do Next

Avoid doing these before the first commerce slice is stable:

- seller/admin dashboard depth
- advanced analytics
- payout automation
- recommendation engine
- complex notification system
- microservice refactor

---

## Working Rule

Only take one major implementation slice at a time.

Recommended order:

1. payments
2. seller onboarding/dashboard
3. admin dashboard
4. refinement features

---

## Update Rule

Update this file whenever:

- the current implementation slice changes
- a major task is completed
- new blockers appear
- priorities shift
