# Checkout and Payments

## Purpose

This document defines how cart validation, checkout, order creation, payment handling, and related failure cases should work in the marketplace platform.

This is one of the most important architecture files because it covers the highest-risk business flow in the system:
turning user purchase intent into a durable, historically correct order.

---

## Goals

### Primary Goals

- make checkout server-authoritative
- keep order and payment states correct and separate
- support safe retries and duplicate-event handling
- preserve historical correctness
- provide a realistic, production-minded flow for a marketplace platform

### Non-Goals

This phase does not aim to implement:

- advanced tax engine
- full payout automation
- complex fraud systems
- multi-provider payment orchestration
- enterprise-grade settlement workflows

The initial target is a strong and correct single-provider flow, likely using Stripe in test mode.

---

## Core Principles

### 1. Server is the source of truth

The client may display cart values, totals, and coupon previews, but final validation must happen on the server.

### 2. Order status and payment status are separate

These represent different lifecycles and must not be merged into one field.

### 3. Historical correctness matters

Once an order is created, historical order records must remain accurate even if product data changes later.

### 4. Sensitive flows must tolerate retries

Checkout initiation and payment confirmation logic should be safe against duplicate submissions or repeated webhook delivery.

### 5. Failure must be expected

The architecture should assume:

- duplicate clicks
- late webhooks
- network interruptions
- stale cart data
- invalid coupons
- product changes during checkout

---

## Core Flow Overview

## Main Flow

The intended flow is:

1. customer signs in
2. customer builds cart
3. customer proceeds to checkout
4. server revalidates cart and pricing
5. server creates pending order / order intent
6. server creates payment session
7. customer completes payment with provider
8. provider confirms payment
9. system updates payment state
10. system updates order state as appropriate
11. customer sees order history

---

## Domain Concepts

## Cart

A mutable pre-purchase container.
The cart is useful for UX, but it is not the historical source of truth.

## Checkout

A server-side validation and transition step that turns cart state into an order/payment attempt.

## Order

A durable commerce record representing the purchase lifecycle.

## Payment

A durable record representing payment state and provider interaction.

## Order Item

A snapshot-backed line item preserving what was purchased at that time.

---

## Cart Architecture

## Cart Responsibilities

The cart should support:

- add item
- remove item
- change quantity
- view subtotal
- preview coupon effect
- carry user purchase intent until checkout

## Rules

- cart totals are provisional
- cart item pricing must be revalidated during checkout
- cart contents may become invalid between add-to-cart and checkout
- cart should not be treated as the final authority for product availability or pricing

### Edge Cases

- same item added from multiple tabs
- quantity changed in one tab while another tab is open
- item price changes after being added
- item becomes unavailable before checkout
- item is archived before checkout

---

## Coupon Architecture

## Coupon Role in Checkout

Coupons may be previewed before checkout, but final validation must happen during checkout.

## Coupon Validation Rules

The server should verify:

- coupon exists
- coupon is active
- coupon is within start/end date
- coupon applies to this user/cart
- usage limits are not exceeded
- stacking rules are respected
- seller-specific restrictions are respected if applicable

### Important Rule

Coupon preview endpoint is advisory.
Final checkout validation decides whether a coupon actually applies.

### Edge Cases

- coupon expires while customer is on checkout page
- coupon usage limit is reached concurrently
- coupon was disabled by admin moments before checkout
- coupon does not apply to all items in cart

---

## Checkout Responsibilities

## Checkout Endpoint Must

- require authenticated user
- load current cart from server-side source
- load current product state
- validate item availability
- validate quantities
- validate coupon
- recompute totals server-side
- create pending order or order intent
- create payment session with provider
- return checkout/session information to client

## Checkout Must Not

- trust client-submitted totals
- trust client-submitted discount calculations
- finalize order solely from frontend redirect success
- assume cart state is still valid without server revalidation

---

## Order Creation Strategy

## Recommended Approach

Create the order before payment is fully finalized, but mark it with appropriate early statuses.

### Example Initial States

- `order_status = pending`
- `payment_status = processing` or `unpaid`

This creates a durable record that the payment flow can attach to.

## Why This Approach Helps

It allows:

- clean tracking of payment attempts
- easier reconciliation with webhook/provider events
- better visibility into abandoned or failed checkout attempts
- clearer debugging and support workflows

---

## Order Snapshot Strategy

## Why Snapshots Are Required

Products and sellers can change after purchase.
Historical orders must still show what the customer actually bought.

## Snapshot Fields Recommended in `order_items`

- product title
- product slug if useful for display
- unit price at purchase
- currency
- seller id at purchase
- relevant selected metadata for historical display

## Rule

Historical order display must not depend entirely on current live product fields.

---

## Order Status Model

## Purpose

Order status tracks the business/fulfillment lifecycle.

## Recommended Statuses

- `pending`
- `confirmed`
- `processing`
- `completed`
- `cancelled`
- `refunded`
- `partially_refunded`

## Meaning

- `pending`: order created, not yet fully confirmed
- `confirmed`: payment accepted and order recognized
- `processing`: order moving through platform-specific processing
- `completed`: order fulfilled successfully
- `cancelled`: order cancelled before completion
- `refunded`: fully refunded
- `partially_refunded`: one or more components refunded

---

## Payment Status Model

## Purpose

Payment status tracks the money/payment lifecycle.

## Recommended Statuses

- `unpaid`
- `processing`
- `paid`
- `failed`
- `refunded`
- `partially_refunded`

## Meaning

- `unpaid`: payment has not been completed
- `processing`: payment is in progress or awaiting provider confirmation
- `paid`: provider-confirmed success
- `failed`: payment attempt failed
- `refunded`: payment fully refunded
- `partially_refunded`: payment partially refunded

---

## Why Status Separation Matters

## Example Scenarios

### Scenario 1

Payment succeeds, but order update is temporarily delayed.

Result:

- payment may be `paid`
- order may still be `pending` until reconciliation completes

### Scenario 2

Order is cancelled after payment.

Result:

- order may become `cancelled`
- payment may become `refunded` later

### Scenario 3

Partial refund on one item.

Result:

- order may be `partially_refunded`
- payment may be `partially_refunded`

This is why one merged status field is not enough.

---

## Payment Session Flow

## Recommended Flow

1. checkout endpoint creates pending order
2. checkout endpoint creates payment session with provider
3. payment session id/provider reference is stored
4. client is redirected to provider checkout
5. provider sends confirmation via callback/webhook
6. system updates payment record
7. system updates order state if appropriate

### Important Rule

Provider-confirmed events are the authoritative signal for final payment success.

Frontend redirect success page is useful for UX, but not sufficient as the only final signal.

---

## Webhook Architecture

## Purpose

Webhook handling ensures payment provider events are applied safely and consistently.

## Webhook Handler Must

- verify authenticity/signature
- parse provider event
- locate payment/order by provider reference
- update payment status safely
- update order status if appropriate
- avoid duplicate side effects

## Idempotency Rule

Webhooks may be delivered more than once.
The handler must safely tolerate duplicate delivery.

### Common Protection Patterns

- store provider event ids
- use unique provider session/payment ids
- check current payment status before applying transitions
- make transitions conditional and safe

---

## Duplicate Submission and Retry Handling

## Checkout Retries

Customers may:

- double click checkout
- refresh during checkout
- retry after a timeout
- retry after partial failure

## Recommended Protection

Use idempotency for checkout initiation where practical.

Examples:

- `Idempotency-Key` header
- unique checkout attempt tracking
- safe reuse of existing pending order when appropriate

## Webhook Retries

Payment providers may retry events if:

- endpoint times out
- endpoint returns failure
- network issues occur

The system must not create duplicate orders or duplicate payment confirmations.

---

## Stock and Availability Behavior

## Important Decision Area

The system must decide when stock is actually reserved or decremented.

For MVP, one of these approaches should be documented clearly:

### Option A — Validate at checkout, finalize near payment confirmation

Simpler approach.
Good for MVP.

### Option B — Reserve stock at checkout initiation

More complex.
May need expiry/release logic.

## Recommendation

For MVP, prefer the simpler documented flow unless true stock contention is central to the product.

### Rules

- stock must be revalidated during checkout
- oversell prevention strategy must be explicit if stock is limited
- unlimited-stock products should bypass stock decrement logic

---

## Multi-Vendor Considerations

## Marketplace Rule

A single order may contain items from multiple sellers.

This means:

- order items need seller association
- seller reporting must be based on seller-scoped order items
- commission logic should be separate from order totals
- platform-wide order view and seller-specific order view are different concerns

## Important Rule

Seller-facing order data must be scoped by seller-owned line items, not full unrestricted orders.

---

## Commission and Seller Revenue

## Recommendation

Keep these concepts separate:

- gross order amount
- per-line item total
- platform commission
- seller net amount
- payout amount

## Why This Matters

If these are mixed too early, reporting and refund logic become harder to reason about.

For MVP:

- record per-line item financials clearly
- optionally create seller commission records during or after order confirmation
- postpone automated payout logic until later

---

## Failure Scenarios

## Scenario: Product Changes During Checkout

A product price or availability changes after cart view.

Expected behavior:

- checkout revalidates server-side
- order is created only from current valid state
- user gets a clear error if item is no longer purchasable

## Scenario: Coupon Becomes Invalid

Expected behavior:

- checkout rejects or recalculates without invalid coupon
- client receives updated message and can retry

## Scenario: Payment Session Created but Redirect Fails

Expected behavior:

- pending order/payment attempt exists
- user may retry safely
- duplicate creation should be avoided

## Scenario: Payment Succeeds but Webhook Is Delayed

Expected behavior:

- frontend may show temporary pending state
- final status resolves after provider confirmation

## Scenario: Webhook Arrives Twice

Expected behavior:

- second event is safely ignored or treated as already applied

## Scenario: Payment Fails After Order Intent Exists

Expected behavior:

- order remains pending or moves to cancelled/failed-related business state per policy
- payment marked failed
- retry policy can be defined later

---

## Customer Experience Rules

## Success Page

A success page may say payment is being confirmed or order is confirmed, depending on system state.

## Recommended UX

If webhook confirmation may lag, use language that avoids false certainty.

Example:

- "Your payment is being confirmed."
- "Your order has been received and is being processed."

## Order History

Customers should be able to see:

- order number
- order status
- payment status
- purchased line items
- totals
- timestamps

Historical display should rely on snapshot-backed order data.

---

## Admin and Support Considerations

## Admin Visibility

Admins should be able to:

- view order/payment state
- review failed or pending orders
- inspect payment references if needed
- act carefully on cancellations/refunds

## Important Rule

Manual admin actions affecting order/payment states should be auditable.

---

## Logging and Observability

## Important Events to Log

- checkout initiated
- checkout failed validation
- payment session created
- payment confirmation received
- payment confirmation failed
- webhook signature invalid
- duplicate webhook ignored
- order state transition applied
- unexpected transition attempt blocked

This logging is useful for debugging, auditing, and future reliability work.

---

## Security Rules

## The System Must Not Trust

- client totals
- client payment success claims
- client coupon claims
- client ownership or role claims

## The System Must Verify

- session identity
- current cart content
- product availability
- coupon validity
- provider webhook signature
- allowed state transitions

---

## Future Upgrade Paths

Possible later upgrades:

- stock reservation with expiry
- background job reconciliation
- async notification workflows
- refund workflows
- payout workflows
- richer tax/fee support
- multi-provider support

These are not required for MVP, but current design should not block them.

---

## Related Documents

- `FEATURE_SPEC.md`
- `DATABASE_SCHEMA.md`
- `API_SPEC.md`
- `DECISIONS.md`
- `architecture/ARCHITECTURE_OVERVIEW.md`

---

## Summary

Checkout and payments should remain:

- server-validated
- idempotent where needed
- historically correct
- role-safe
- resilient to duplicate and delayed events

The architecture should optimize for correctness first, then expand toward richer marketplace behavior.
