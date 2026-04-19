# Next Steps

## Purpose

This file tracks the immediate next actions for the project.

It should stay short, practical, and current.
This is the execution list, not the long-term roadmap.

---

## Current Objective

Move from catalog foundation into authentication and role groundwork.

---

## Immediate Next Tasks

### 1. Start auth and role groundwork

- connect Supabase auth
- create profile synchronization approach
- define role loading strategy
- prepare protected route patterns for future seller/admin areas

### 2. Replace placeholder database types

- generate Supabase database types once schema work starts
- wire generated types into `src/lib/supabase/*`

### 3. Decide whether to add test tooling in the next slice

- add Vitest and React Testing Library when auth and role logic arrives
- avoid adding empty test scaffolding with no meaningful coverage target

### 4. Expand the catalog read path only where it supports the next phases

- decide whether `/` remains the main catalog landing page long-term
- add filter/sort/search UI only if it supports auth/cart work and does not duplicate effort
- decide when to switch from fallback catalog data to fully live Supabase catalog reads

---

## First Build Sequence

### Step 1 - Auth Foundation

Build:

- sign in / sign up flow
- session-aware server checks
- profile creation or synchronization
- role loading
- protected route foundation

### Step 2 - Seller/Profile Foundations

Build:

- seller profile model
- seller status handling
- server-side role/status checks

### Step 3 - Cart Foundation

Build:

- cart data model
- add/remove/update cart behavior
- cart read endpoint
- basic cart UI

### Step 4 - Checkout Foundation

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

- whether seller approval is mandatory before any product creation or only before publishing
- how much stock logic is needed in MVP
- whether cart requires guest-cart support now or later
- whether initial checkout should create pending orders immediately or create an order intent first
- when to add formal test tooling relative to the auth and cart slices
- whether public catalog filters/search UI should return in the next two phases or wait until auth/cart are stable

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

1. auth + roles
2. cart
3. checkout
4. payments
5. orders
6. seller dashboard
7. admin dashboard

---

## Update Rule

Update this file whenever:

- the current implementation slice changes
- a major task is completed
- new blockers appear
- priorities shift
