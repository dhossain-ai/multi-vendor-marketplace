# Phase 17C — Customer Commerce UI Audit

## 1. Purpose

Audit the authenticated customer commerce surfaces before polishing cart, checkout, account, address, and order presentation. This phase focuses on making the buying and account-management experience feel more trustworthy and ecommerce-ready without changing checkout, payment, ownership, or order logic.

## 2. Scope

Reviewed public/customer presentation in:

- `/cart`
- `/checkout`
- `/checkout/success`
- `/checkout/cancel`
- `/account`
- `/account/profile`
- `/account/addresses`
- `/orders`
- `/orders/[id]`
- customer-facing cart, checkout, account, address, and order components

Checkout/payment repositories, seller/admin logic, migrations, and schema were intentionally excluded.

## 3. Pages/components reviewed

- `src/features/cart/components/cart-view.tsx`
- `src/features/cart/components/cart-item-row.tsx`
- `src/features/cart/components/cart-summary.tsx`
- `src/features/cart/components/cart-empty-state.tsx`
- `src/features/checkout/components/checkout-view.tsx`
- `src/app/checkout/success/page.tsx`
- `src/app/checkout/cancel/page.tsx`
- `src/features/auth/components/account-summary.tsx`
- `src/features/account/components/account-profile-form.tsx`
- `src/features/account/components/address-list-view.tsx`
- `src/features/account/components/address-card.tsx`
- `src/features/account/components/address-form.tsx`
- `src/features/orders/components/orders-list-view.tsx`
- `src/features/orders/components/orders-empty-state.tsx`
- `src/features/orders/components/order-detail-view.tsx`

## 4. Cart UI issues

- Cart item rows have the right controls, but the product information, availability, price, and action areas can scan more clearly.
- The order summary can better distinguish subtotal, savings, total, coupon state, and the provisional nature of cart totals.
- Empty cart recovery should point directly back to product browsing.
- Unavailable/limited-stock messaging should stand out without changing validation.

## 5. Checkout UI issues

- Checkout has the right server-authoritative flow, but it needs a stronger step structure around review, shipping address, and secure payment.
- Selected address options should feel more like shipping cards and remain easy to tap on mobile.
- Order summary should make savings, blocked checkout states, and secure payment expectations clearer.
- The page should reinforce that payment confirmation remains provider/server-authoritative.

## 6. Success/cancel page issues

- Success and cancel pages are correct but can feel more confidence-building.
- Success should lead with order received and payment confirmation pending, not imply final paid state.
- Cancel should make retry paths and safe recovery actions easier to scan.

## 7. Account/profile/address UI issues

- Account hub should feel more like a customer dashboard and less like a simple link map.
- Profile display should make read-only email/account type clear while keeping full-name editing focused.
- Address cards and forms should better separate contact, destination, default state, and actions.
- Empty address state should make the next action obvious.

## 8. Order history/detail UI issues

- Order history cards should improve order number/date/status/total hierarchy and provide an explicit view CTA.
- Order detail should better separate status, payment, item snapshots, shipping snapshot, tracking, shipment notes, and totals.
- Snapshot language should stay customer-facing while preserving historical order truth.

## 9. Responsive/mobile issues

- Cart rows, checkout item cards, address options, order cards, and order detail panels need tighter stacked behavior.
- Buttons should remain full-width or tap-friendly where mobile context calls for it.
- Long order numbers, session references, addresses, and tracking codes should wrap without horizontal scroll.

## 10. Accessibility issues

- Form controls need clear labels, visible focus states, and tap-friendly dimensions.
- Cards acting as links should expose obvious action text and focus styling.
- Status and recovery messages should use semantic headings and readable contrast.

## 11. Fixes applied

To be completed after implementation:

- Cart item, summary, coupon, unavailable, and empty-state polish
- Checkout step, shipping address, order summary, blocked-state, and trust-message polish
- Success/cancel page confidence and recovery polish
- Account, profile, address list/card/form polish
- Order history/detail status, item snapshot, shipping, tracking, totals, and CTA polish
- Responsive and accessibility pass

## 12. Remaining follow-ups

Recommended follow-ups after Phase 17C:

- Add fuller checkout idempotency/RPC hardening in a backend reliability phase.
- Add richer order timeline visuals if fulfillment events become more granular.
- Consider account dashboard summary counts only if dedicated customer read models are added.
- Keep refunds, payouts, notifications, wishlist, and reviews out of this phase.
