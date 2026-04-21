# Next Steps

## Purpose

This file tracks the immediate next actions for the project.

It should stay short, practical, and current.
This is the execution list, not the long-term roadmap.

---

## Current Objective

Consolidate the new marketplace operations model and remove the remaining temporary infrastructure gaps.

---

## Immediate Next Tasks

### 1. Generate Supabase types from the real schema

- link a real Supabase project or local database to the repo
- generate database types from the finalized migration chain
- replace the fragile hand-written subset in `src/types/database.ts`

### 2. Improve the customer account area

- add real profile editing and address-management groundwork
- keep account pages customer-first instead of turning them into a system map
- preserve separate entry points for seller and admin tooling

### 3. Resolve the catalog static-generation warning path

- stop product slug generation from touching `cookies()` at build time
- keep public catalog generation compatible with real Supabase reads where possible
- preserve the demo-data fallback for local environments that still need it

### 4. Harden marketplace operations after the reset

- apply the new fulfillment migration to a real Supabase project and verify seller update permissions
- harden admin audit logging around fulfillment-sensitive actions
- refine seller/customer operational messaging once live data is flowing

---

## After That

### Refinement

- richer seeded marketplace scenarios
- review/wishlist system
- notification workflows
- refund workflows
- broader reliability hardening

---

## What Not To Do Next

Avoid doing these before generated types, customer-account depth, and storefront reliability are stable:

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

1. database foundation fix
2. product UX reset
3. seller onboarding
4. marketplace operations
5. generated types
6. customer account depth
7. refinement features

---

## Update Rule

Update this file whenever:

- the current implementation slice changes
- a major task is completed
- new blockers appear
- priorities shift
