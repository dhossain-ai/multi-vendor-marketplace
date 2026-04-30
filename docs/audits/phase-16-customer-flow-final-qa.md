# Phase 16 — Customer Flow Final QA and Security Cleanup

## 1. Purpose

Final QA and security cleanup for the customer and visitor lifecycle across catalog, authentication, account, cart, coupon, checkout, payment handoff, and order history.

## 2. Scope

Reviewed the customer-facing routes and modules only. Wishlist, reviews, refunds, payouts, notifications, admin order operations, seller flow rewrites, and broad redesigns remained out of scope.

## 3. Automated checks

Baseline checks before Phase 16 fixes:

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed, with no catalog `cookies()` static-generation warning.

Final checks are recorded after the fixes below.

Final checks after Phase 16 fixes:

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed, with no catalog `cookies()` static-generation warning. `/products/[slug]` was prerendered with `generateStaticParams`.

## 4. Manual QA checklist

- Visitor storefront and product discovery.
- Authentication and protected-route redirects.
- Account profile and address book.
- Cart mutation and coupon preview.
- Checkout address selection and payment handoff.
- Checkout success/cancel messaging.
- Customer order list and detail.
- Fulfillment tracking visibility.
- Server-side ownership and authorization checks.
- Customer-facing wording.

## 5. Visitor/catalog QA

Routes reviewed:

- `/`
- `/products`
- `/products?q=...`
- `/products?category=...`
- `/products?sort=price_asc`
- `/products?page=2`
- `/products/[slug]`

Findings:

- Public catalog reads use the cookie-free Supabase public client.
- Build no longer emits the prior catalog `cookies()` warning.
- Public product listing and detail routes do not require auth.
- Product visibility is enforced server-side before rendering.
- Query params are bounded and normalized before reaching the catalog repository.
- Product detail now presents out-of-stock products as visible but not addable to cart.

## 6. Authentication QA

Routes reviewed:

- `/sign-up`
- `/sign-in`
- `/auth/callback`
- `/account`
- `/account/profile`
- `/account/addresses`
- `/cart`
- `/checkout`
- `/orders`

Findings:

- Signed-out protected routes redirect to `/sign-in?next=...`.
- Signup and callback ensure a customer profile through server-side profile creation.
- Customer role is not client-editable in the account UI.
- Admin is not automatic; seller registration remains separate at `/seller/register`.

## 7. Account/profile/address QA

Routes reviewed:

- `/account`
- `/account/profile`
- `/account/addresses`

Findings:

- Customer profile editing is limited to full name.
- Email and role are read-only in the UI.
- Address actions derive `user_id` from the authenticated server session.
- Address reads, updates, deletes, and default selection filter by server-derived owner.
- First address becomes default; deleting a default leaves no default until another address is explicitly set or a new address is created.

## 8. Cart QA

Routes/modules reviewed:

- `/cart`
- add-to-cart from `/products/[slug]`
- `src/features/cart/`

Findings:

- Cart requires auth.
- Add, update, remove, clear, apply coupon, and remove coupon are server actions.
- Cart ownership is derived from the authenticated session.
- Client user IDs, prices, and totals are not accepted.
- Quantity and stock rules are validated server-side.

## 9. Coupon QA

Findings:

- Coupon apply/remove is server-side.
- Cart coupon display is advisory/provisional.
- Checkout revalidates saved coupons before order creation.
- Orders persist coupon IDs plus discount and per-line discount snapshots.
- Invalid/expired/disabled/usage-limited coupon paths return customer-readable messages.

## 10. Checkout/address/payment QA

Routes reviewed:

- `/checkout`
- `/checkout/success`
- `/checkout/cancel`

Findings:

- Checkout requires auth.
- Checkout requires a saved shipping address.
- Default address or first saved address is preselected.
- Selected address is loaded by `getAddressForUser(userId, addressId)`.
- Checkout does not accept raw address fields.
- `orders.shipping_address_snapshot` is populated from the saved address.
- Stripe Checkout charges `orders.total_amount`.
- Client success redirect does not mark payment paid.
- Stripe webhook remains the payment source of truth.
- Pending-order creation still needs deeper transaction/RPC and duplicate-submit hardening later.

## 11. Order history/detail QA

Routes reviewed:

- `/orders`
- `/orders/[id]`

Findings:

- Customer order list and detail filter by server-derived `customer_id`.
- Order detail renders historical item snapshots.
- Shipping address snapshot is shown on detail.
- Discounts are shown as savings.
- Tracking code and shipment note are visible when present.
- Customers cannot mutate order, payment, or fulfillment status.

## 12. Fulfillment/tracking visibility QA

Findings:

- Customer order detail shows fulfillment status per order item.
- Tracking code, shipment note, shipped timestamp, and delivered timestamp render from order-item fulfillment fields when available.
- Fulfillment mutation paths remain seller-scoped and outside this phase.

## 13. Security and ownership review

Reviewed:

- profile update
- address CRUD/default
- cart add/update/remove/clear
- coupon apply/remove
- checkout start
- order list/detail
- payment retry/start payment

Findings:

- `user_id` and `customer_id` are derived from the authenticated server session.
- Address ownership is checked server-side.
- Cart ownership is checked server-side.
- Order ownership is checked server-side.
- Checkout totals are recalculated server-side.
- Payment success is webhook-authoritative.
- No customer route exposes seller/admin-only data.

## 14. Bugs found

- Public catalog query params needed stricter bounds and normalization.
- Product detail showed out-of-stock items as generally available.
- Catalog Supabase reads could enforce seller/category visibility more directly in queries.
- Checkout post-order cart cleanup could include a second owner check before deleting cart items.
- Payment retry/cancel edges accepted broader state/input than needed.
- Customer-facing copy still mentioned implementation/test-mode language in a few places.

## 15. Fixes applied

- Bounded and normalized `/products` search, category, sort, and page parameters.
- Removed a server-rendered sort `onChange` handler and replaced it with an explicit submit button.
- Added stock-aware public catalog availability labels.
- Kept out-of-stock products visible while disabling add-to-cart from product detail.
- Added direct Supabase query filters for active product, approved seller, and active category on public catalog reads.
- Rechecked cart ownership before checkout post-order cart item cleanup and coupon cleanup.
- Tightened payment retry behavior for terminal payment states.
- Sanitized `/checkout/cancel` order retry links to UUID-shaped order IDs.
- Replaced customer-visible implementation/test-mode wording with production-facing copy.

## 16. Remaining risks

- Pending-order creation still uses application-side compensation instead of one database transaction/RPC.
- Very fast duplicate checkout submissions can still create separate pending orders before cart clearing completes.
- Stripe webhook endpoint still needs production HTTPS/live webhook registration outside local development.
- Full-text catalog search remains a later scalability improvement.

## 17. Recommended next phase

Phase 17 — Frontend UX and Presentation Polish.
