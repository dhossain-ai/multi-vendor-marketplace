# Next Steps

## Purpose

This file tracks the immediate next actions for the project.

It should stay short, practical, and current.
This is the execution list, not the long-term roadmap.

---

## Current Objective

Consolidate the demand side of the marketplace: Begin Customer / Visitor Workflow Recovery.

---

## Immediate Next Tasks

### Phase 11 — Customer / Visitor Workflow Blueprint
- Define the desired state for the visitor storefront and product browsing.
- Detail the customer sign-up, cart, and checkout flow.
- Establish the baseline for customer account and order history management.

### Phase 12 — Customer / Visitor Code Audit
- Audit the current storefront, cart, checkout, and account code.
- Identify dead code, missing features, and UX gaps.

### Phase 13 — Customer Account and Address Management
- Recover the customer profile editing and address book.

### Phase 14 — Cart, Checkout, and Customer Order Cleanup
- Solidify the cart logic, handle out-of-stock edges, and secure the checkout payment handoff.
- Clean up the customer order history detail views.

### Phase 15 — Catalog/Search/Storefront Reliability Cleanup
- Address the `cookies()` static-generation warnings and resolve storefront hydration/reliability issues.

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

Avoid doing these before the core customer buying journey is solid:

- payouts and Stripe Connect integration
- refund workflows and admin exception operations
- transactional notification emails

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
