# Phase 8: Seller Order Privacy and Fulfillment Rules

## Summary
Phase 8 hardens seller order handling, making it production-ready and secure for a multi-vendor environment. It scopes order visibility to seller-owned items only, enforces fulfillment transition rules, hides sensitive customer data by default, and removes the risk of sellers mutating parent order or payment status.

## Seller Order Privacy Behavior
- **Strict Scope**: Sellers only see `order_items` that belong to their `seller_id`. Summaries and financial totals are calculated purely from these scoped items. Sellers cannot view order items or financial totals from other sellers.
- **Customer Email Hidden**: The `customerEmail` property has been removed entirely from the seller order detail view and repository to protect customer privacy.
- **Read-Only Payment**: Payment status is strictly read-only for sellers. They can view the payment status to know when it is safe to fulfill an order, but they cannot transition or refund payments.

## Fulfillment Transition Behavior
- Sellers can transition order items through the following states:
  - `unfulfilled` -> `processing`
  - `processing` -> `shipped`
  - `unfulfilled` -> `shipped`
  - `shipped` -> `delivered`
- Backward transitions are prevented (e.g. `delivered` -> `shipped`, `shipped` -> `processing`).
- Transitions require the `order_id`, matching `seller_id`, and that the overall order has a `paid` payment status.
- Once an order reaches `cancelled`, `refunded`, or `partially_refunded`, no further transitions are allowed.

## Tracking and Shipment Note Behavior
- Sellers can add an optional `trackingCode` and `shipmentNote` when marking an item as `shipped` or `delivered`.
- Max lengths have been added for both `trackingCode` (100 characters) and `shipmentNote` (500 characters) to prevent abuse or database column exhaustion.
- These fields are surfaced safely to the customer's order history page.

## Cancellation Behavior
- Seller-initiated cancellation has been completely removed from the UI.
- The `cancelled` status transition has been removed from allowed seller transitions on the backend.
- Sellers cannot cancel paid order items. Cancellation is reserved for admin operations or future refund tooling.

## Security/Permission Behavior
- `seller_id` is never accepted from client form data. It is always derived from the server session (`session.sellerProfile.id`).
- All mutation checks explicitly verify `seller_id`. 
- Only explicitly allowed `fulfillmentStatus` transitions bypass the type guards.

## Customer/Admin Order Impact
- The customer order view already safely displays the provided tracking code and shipment notes for items.
- The admin order view is unaffected and still controls parent order cancellation/refunds.

## Known Follow-ups for Later Phases
- Admin/Seller tooling for refunds and cancellations.
- Payout logic separating seller gross sales from platform fees.
- Notifications and transactional emails for fulfillment transitions.
