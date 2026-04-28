# Phase 14 — Cart, Checkout, and Customer Order Cleanup

## Summary

Phase 14 connects saved customer addresses into checkout, snapshots the chosen shipping address into new orders, displays that historical address on order detail, and fixes the Stripe discounted-total mismatch found in the Phase 12 audit.

No guest checkout, billing address UI, refunds, payouts, wishlist, reviews, notifications, admin order operations, or catalog static-generation cleanup were added.

## Current Flow Audited

The checkout flow now works as follows:

1. `/checkout` requires an authenticated user.
2. `validateCheckout(userId)` loads the customer cart by server-derived `user_id`.
3. Checkout reloads cart items with product, seller, category, stock, price, and status data.
4. Checkout revalidates product availability, seller approval, category activity, quantity, single-currency rules, and saved coupon validity.
5. Checkout displays saved customer addresses loaded by `listAddressesForUser(userId)`.
6. `submitCheckoutAction(formData)` requires a selected `shippingAddressId`.
7. `createPendingOrder(userId, shippingAddressId)` reloads the address with `getAddressForUser(userId, shippingAddressId)`.
8. Pending order totals are calculated server-side from the revalidated cart and coupon.
9. `orders.shipping_address_snapshot` is populated at order creation time.
10. `order_items` are inserted from historical item snapshots.
11. Cart items are cleared after order/order-item creation succeeds.
12. Stripe Checkout is created for the pending order when Stripe env is configured.

## Checkout Address Selection

- Checkout shows saved shipping address choices.
- The default address is preselected when present; otherwise the first saved address is selected.
- Customers can choose another saved address.
- Checkout links to `/account/addresses` for address creation and editing.
- If the customer has no saved addresses, checkout shows a clear required-address message and blocks payment submission.

MVP decision: shipping address is required. Billing address remains deferred.

## Shipping Address Snapshot

New pending orders now persist `orders.shipping_address_snapshot` using the selected customer-owned address.

Snapshot shape:

```json
{
  "recipient_name": "Example User",
  "line_1": "123 Main St",
  "line_2": null,
  "city": "Vilnius",
  "state_region": null,
  "postal_code": "12345",
  "country_code": "LT",
  "phone": "+370...",
  "label": "Home"
}
```

The snapshot does not include `user_id` or internal address metadata. Later address edits do not mutate historical orders.

## Order Detail Address Display

Customer order detail now displays the saved shipping snapshot:

- recipient name
- address lines
- city/state/postal/country
- phone when present

Older orders without a snapshot show:

`No shipping address was saved for this order.`

Order detail does not attempt to reconstruct missing address data from the current address book.

## Stripe Total Mismatch Fix

Phase 12 identified that Stripe Checkout could charge the undiscounted item subtotal because Stripe line items were built from `order_items.unit_price_amount * quantity`.

Fix applied:

- Stripe Checkout now uses one aggregate line item.
- Line item name: `Marketplace order {order_number}`.
- Stripe amount: `orders.total_amount`.
- Stripe currency: `orders.currency_code`.
- Order itemization remains local in `orders` and `order_items`.
- Stripe metadata still includes `order_id` and `order_number`.

This keeps Stripe charges aligned with server-calculated totals, including coupon discounts.

## Idempotency and Rollback Review

Existing behavior preserved:

- Existing open Stripe sessions for processing payments are reused when possible.
- Terminal payment statuses are skipped during duplicate webhook processing.
- Pending order creation rolls back order/order-items if item insertion or cart clearing fails.
- If Stripe session creation fails after the pending order exists, the user is redirected to the order detail page to retry payment.

Small improvement:

- Stripe session creation now sends the generated idempotency key to the Stripe request as well as storing it on the payment row.

Remaining limitation:

- Pending order creation still uses application-side compensation instead of a single database transaction/RPC.
- Very fast duplicate checkout submissions can still create separate pending orders before cart clearing completes.

## Cart and Checkout Messaging

- Cart unavailable and limited-stock messages now tell the customer to remove unavailable items or update quantities before checkout.
- Checkout ready messaging now says `Ready for payment review`.
- Checkout blocks payment when cart issues or missing shipping address remain.
- Coupon validation remains server-side and final at checkout.

## Customer Order Copy

- Customer order labels were tightened to shopper-facing wording.
- Order detail now labels discounts as savings.
- Fulfillment tracking code and shipment note remain visible when sellers provide them.
- Customers still cannot mutate order, payment, or fulfillment state.

## Security and Ownership

- Customer identity is still derived from the authenticated server session.
- Checkout accepts only `shippingAddressId`, never raw address fields or `user_id`.
- Address ownership is verified server-side with `user_id` and `address_id`.
- Cart, coupon, checkout, and payment amounts remain server-authoritative.
- Payment success remains webhook/provider-authoritative.

## Quality Checks

Baseline before edits:

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed with the known catalog `cookies()` static-generation/demo fallback warnings.

Implementation checks during Phase 14:

- `npm run lint`: passed after checkout/address selection work.
- `npm run typecheck`: passed after checkout/address selection work.
- `npm run lint`: passed after order detail snapshot work.
- `npm run typecheck`: passed after order detail snapshot work.
- `npm run lint`: passed after Stripe total and messaging fixes.
- `npm run typecheck`: passed after Stripe total and messaging fixes.

Final verification:

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed with the known catalog `cookies()` static-generation/demo fallback warnings.

## Remaining Risks and Follow-ups

- Replace application-side pending-order compensation with a transaction/RPC.
- Add a stronger duplicate-submit/idempotency strategy for pending order creation.
- Consider whether billing snapshot should mirror shipping or remain null for MVP.
- Add richer end-to-end tests for address selection, snapshot creation, Stripe amount matching, and order detail display.
- Keep the catalog `cookies()` static-generation warning for Phase 15.

## Recommended Phase 15 Scope

Phase 15 should focus on catalog/search/storefront reliability:

- resolve catalog static-generation `cookies()` warnings
- add or harden `/products` listing/search/filter/sort/pagination
- remove demo-data fallback from production-like paths once Supabase catalog reads are reliable
- keep shopper storefront navigation and product discovery customer-first
