# Next Steps

## Purpose

This file tracks the immediate next actions for the project.

It should stay short, practical, and current.
This is the execution list, not the long-term roadmap.

---

## Current Objective

Move from seller dashboard into admin dashboard and platform controls.

---

## Immediate Next Tasks

### 1. Build admin dashboard shell

- create admin dashboard layout and navigation
- add admin-scoped data loading
- implement platform overview metrics

### 2. Build seller management admin flow

- admin can view all sellers
- admin can approve/reject/suspend sellers
- seller status changes update operational access

### 3. Build product moderation admin view

- admin can view all products across sellers
- admin can suspend products
- admin actions are separate from seller product editing

### 4. Build category management

- admin can create/edit/archive categories
- category changes do not break historical product/order references
- seller product form can select from available categories

### 5. Build coupon management

- admin can create/edit/activate/deactivate coupons
- coupon validation integrated into checkout flow

### 6. Replace hand-written schema types with generated Supabase types

- generate database types from the real Supabase schema
- wire generated types into `src/lib/supabase/*` and repository helpers
- eliminate two-query workarounds caused by missing Relationships metadata

---

## After That

### Refinement

- seller onboarding application UI
- commission logic
- review/wishlist system
- notification workflows
- refund workflows

---

## What Not To Do Next

Avoid doing these before the admin dashboard is stable:

- advanced analytics
- payout automation
- recommendation engine
- complex notification system
- microservice refactor
- multi-provider payment support

---

## Working Rule

Only take one major implementation slice at a time.

Recommended order:

1. ~~payments~~ ✅
2. ~~seller dashboard~~ ✅
3. admin dashboard
4. refinement features

---

## Update Rule

Update this file whenever:

- the current implementation slice changes
- a major task is completed
- new blockers appear
- priorities shift
