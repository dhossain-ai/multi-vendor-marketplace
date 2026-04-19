# Seller and Admin Flows

## Purpose

This document defines the architecture and operational flow for seller-facing and admin-facing areas of the marketplace platform.

It explains:

- how seller workflows should work
- how admin workflows should work
- how ownership and moderation boundaries should be enforced
- how platform operations differ from public/customer flows

---

## Goals

### Primary Goals

- keep seller and admin concerns clearly separated
- enforce ownership boundaries for seller operations
- make admin authority explicit and controlled
- support realistic marketplace workflows
- avoid mixing public catalog logic with operational dashboard logic

### Non-Goals

This stage does not aim to support:

- complex internal team workflows
- advanced CRM/support systems
- multi-level admin roles
- seller organization/team subaccounts

The initial goal is a clean seller/admin foundation.

---

## Domain Separation

## Seller Domain

Seller flows are operational and self-scoped.

Seller responsibilities include:

- maintaining seller profile
- managing own products
- viewing own orders
- viewing own earnings summaries

## Admin Domain

Admin flows are platform-scoped.

Admin responsibilities include:

- reviewing sellers
- moderating products
- managing coupons and categories
- monitoring orders
- viewing platform-level metrics
- enforcing policy and operational controls

---

## Seller Flow Overview

## Seller Lifecycle

A typical seller flow is:

1. user signs in
2. user becomes or applies to become seller
3. seller profile is created
4. seller status is reviewed if approval is required
5. seller becomes approved
6. seller gains access to seller dashboard
7. seller manages products and views seller-scoped data

---

## Seller Access Rules

## Seller Must Have

- authenticated user
- seller role
- seller profile
- approved seller status for active marketplace actions

## Seller Cannot

- access other sellers' products
- access other sellers' order data
- access admin-only settings
- bypass approval or suspension state

### Important Rule

Seller dashboard access is not just role-based.
It is role + seller profile + seller status + ownership.

---

## Seller Dashboard Architecture

## Main Seller Areas

Recommended seller dashboard sections:

- overview/summary
- products
- create/edit product
- orders
- earnings summary
- store settings/profile

## Seller Summary Data

Typical summary data:

- total products
- active products
- pending orders
- gross sales
- estimated net earnings

### Rules

- seller summary should be based only on seller-owned data
- summary data may be eventually consistent if later reporting becomes heavier
- calculations should not rewrite historical numbers

---

## Seller Product Flow

## Core Flow

1. seller creates product
2. server validates seller eligibility
3. server assigns ownership to seller
4. product enters allowed initial status
5. seller can later edit, archive, or update allowed fields

## Rules

- ownership is derived from authenticated seller identity
- seller cannot assign product to another seller
- seller cannot update protected admin-only fields
- price changes affect future sales only, not historical orders
- archiving a product is preferred over hard deletion

### Product Status Considerations

Seller may be allowed to:

- create draft products
- publish products if platform policy allows
- request review if moderation is required
- archive products

Admin may still retain final authority to suspend or moderate.

---

## Seller Order Flow

## Seller Order View

Seller should see seller-scoped order information, typically based on order items belonging to their products.

### Important Rule

In a multi-vendor marketplace, a seller should not automatically see full unrestricted order data for other sellers' items.

## Seller Order Data May Include

- order number
- order/item status
- payment summary if appropriate
- purchased product snapshot
- quantity
- total amount relevant to seller
- timestamps

### Rules

- seller access should be scoped by seller-owned line items
- platform-wide order visibility is admin-only
- seller reporting should separate gross amounts from estimated net amounts if commission applies

---

## Seller Earnings Flow

## Purpose

Seller earnings views should help sellers understand business performance without becoming a full accounting system.

## Recommended Data

- gross sales
- platform commission
- estimated net amount
- recent order value summary

## Rules

- earnings should be based on historical order item financial data
- if commission rate changes later, old orders must not be recalculated incorrectly
- payout automation may be postponed, but revenue separation should still be modeled clearly

---

## Seller Suspension Behavior

## Rules

If a seller becomes suspended:

- seller should lose ability to create or update active products
- public visibility of seller products may change depending on policy
- historical orders must remain valid and readable
- seller-scoped reporting/history should not disappear unless there is a strong reason

### Important Principle

Operational restriction must not corrupt commerce history.

---

## Admin Flow Overview

## Admin Lifecycle

Admin users operate platform controls rather than storefront behavior.

Typical admin flow areas:

- dashboard summary
- seller review and moderation
- product moderation
- coupon management
- category management
- order monitoring
- policy-driven operational actions

---

## Admin Access Rules

## Admin Must Have

- authenticated user
- admin role

## Admin Can

- view platform-level operational data
- change seller status
- suspend products or sellers
- manage categories
- manage coupons
- view order monitoring interfaces

## Admin Must Not

- silently rewrite historical financial records
- bypass audit logging for sensitive operations
- expose internal controls through public/customer routes

---

## Admin Dashboard Architecture

## Main Admin Areas

Recommended admin dashboard sections:

- platform overview
- seller management
- product moderation
- order monitoring
- coupon management
- category management
- settings or policy controls
- audit-sensitive operational actions

## Dashboard Summary

May include:

- total customers
- total sellers
- pending seller approvals
- active products
- orders today
- gross platform revenue
- platform commission totals

### Rule

Admin summary is platform-scoped and must be kept separate from seller summary logic.

---

## Seller Approval / Rejection Flow

## Typical Flow

1. seller application exists
2. admin reviews seller profile/application
3. admin sets status to approved, rejected, or suspended
4. system updates seller access accordingly
5. action is audit logged

## Rules

- approval changes seller operational access
- rejection or suspension must not break historical records
- seller status changes should be explicit and traceable

---

## Product Moderation Flow

## Typical Flow

1. seller creates or updates product
2. product becomes available according to platform policy
3. admin may later review or moderate if needed
4. admin can suspend or otherwise restrict visibility
5. historical orders remain intact

## Rules

- admin moderation must be distinct from seller product editing
- admin product actions should be auditable
- moderation state should not corrupt order history

---

## Coupon and Category Admin Flows

## Coupon Management

Admin can:

- create coupon
- update coupon
- activate/deactivate coupon
- define scope and validity

### Rules

- coupon changes affect future checkout validation
- coupon changes must not rewrite already finalized order totals

## Category Management

Admin can:

- create categories
- update categories
- archive or disable categories

### Rules

- category changes should not break historical product references
- disabling a category should be handled more safely than destructive deletion

---

## Admin Order Monitoring Flow

## Purpose

Admin order views are for operational visibility, support, and policy enforcement.

## Admin Can View

- order status
- payment status
- customer identity summary
- seller relationships
- order items
- financial summary
- timestamps
- flags for failed/pending states

## Rules

- manual order state changes should be tightly controlled
- sensitive order actions should be auditable
- admin actions should respect allowed transition rules unless an explicit override policy exists

---

## Shared Flow Boundaries

## Seller vs Admin

Seller actions are ownership-scoped.
Admin actions are platform-scoped.

## Important Rule

Do not reuse seller endpoints for admin behavior or vice versa without explicit design.

This keeps:

- authorization clearer
- API easier to reason about
- audit logic more reliable

---

## Data Access Patterns

## Seller Queries

Seller queries should always be scoped by seller identity.

Examples:

- seller-owned products
- seller-owned order items
- seller commission records
- seller summary metrics

## Admin Queries

Admin queries may access platform-wide records, but should still remain intentional and well-bounded.

Examples:

- all sellers by status
- all products by moderation state
- all orders by order/payment filters
- coupon and category inventory

---

## Concurrency and Operational Risks

## Seller Risks

- seller edits product while a checkout is in progress
- seller changes price during active customer session
- seller archives a product being viewed publicly

## Admin Risks

- admin suspends seller with pending orders
- admin disables coupon during active checkout
- admin changes category state while product listing is cached
- admin and seller edit the same product close together

### Rule

Critical operational mutations should be validated against current business state, and audit visibility should exist for sensitive actions.

---

## Audit and Logging

## Seller Events Worth Logging

- product created
- product updated
- product archived
- seller status change effect on access

## Admin Events Worth Logging

- seller approved/rejected/suspended
- product suspended/reactivated
- category changes
- coupon changes
- manual order state changes

---

## Future Upgrade Paths

Possible later expansions:

- seller support inbox
- seller staff accounts
- product review queue
- richer admin moderation tools
- support role separate from admin
- dispute/refund workflows
- payout management UI

Not required for MVP.

---

## Related Documents

- `architecture/ARCHITECTURE_OVERVIEW.md`
- `architecture/auth-and-roles.md`
- `FEATURE_SPEC.md`
- `DATABASE_SCHEMA.md`
- `API_SPEC.md`

---

## Summary

Seller and admin flows should remain:

- clearly separated
- role-safe
- ownership-aware
- operationally explicit
- audit-friendly
