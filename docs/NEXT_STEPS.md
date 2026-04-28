# Next Steps

## Purpose

This file tracks the immediate next actions for the project.

It should stay short, practical, and current.
This is the execution list, not the long-term roadmap.

---

## Current Objective

Phase 14 (Cart, Checkout, and Customer Order Cleanup) is complete.

Next: begin Phase 15 — Catalog/Search/Storefront Reliability Cleanup.

---

## Immediate Next Tasks

### Phase 11 — Customer / Visitor Workflow Blueprint ✅
- Blueprint created at `docs/blueprint/01-customer-flow.md`.
- Covers visitor journey, auth, account, addresses, cart, coupon, checkout, Stripe payment, orders, fulfillment, status labels, security, edge cases, and acceptance criteria.
- Open questions documented for Phase 12+ decisions.

### Phase 12 — Customer / Visitor Code Audit ✅
- Audit created at `docs/audits/phase-12-customer-visitor-code-audit.md`.
- Identified missing customer profile editing, address book, address schema/types, and checkout shipping snapshots.

### Phase 13 — Customer Account and Address Management ✅
- Added `/account/profile`.
- Added `/account/addresses`.
- Added `public.addresses` migration and customer-owned address actions.
- Added checkout default-address preview without changing Stripe checkout behavior.

### Phase 13.5 — Address Migration Verification and Typegen Unblock ✅
- Applied `202604280001_customer_addresses.sql` to linked dev project `hhfcmcopjvyitjxcrmoy`.
- Confirmed `public.addresses` schema, RLS, indexes, and `updated_at` trigger in the dev database.
- Regenerated `src/types/database.ts` from the linked dev project.

### Phase 14 — Cart, Checkout, and Customer Order Cleanup ✅
- Added checkout shipping address selection.
- Populated `orders.shipping_address_snapshot` from a customer-owned address.
- Displayed the saved shipping snapshot on customer order detail.
- Fixed the discounted Stripe total mismatch by charging the server-calculated order total.
- Reviewed checkout idempotency and rollback risk.
- Kept cart, coupon, and checkout totals server-authoritative.

### Phase 15 — Catalog/Search/Storefront Reliability Cleanup
- Address the `cookies()` static-generation warnings.
- Add or harden `/products` listing/search/filter/sort/pagination.
- Reduce production-like reliance on demo-data fallback.
- Keep product discovery customer-first.

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
7. checkout address snapshots
8. catalog/search/storefront reliability
9. refinement features

---

## Update Rule

Update this file whenever:

- the current implementation slice changes
- a major task is completed
- new blockers appear
- priorities shift
