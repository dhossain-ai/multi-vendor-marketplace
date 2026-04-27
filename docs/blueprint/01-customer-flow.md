# 01 — Customer / Visitor Flow Blueprint

> **Related docs**: [02-seller-flow.md](./02-seller-flow.md) · [FEATURE_SPEC.md](../FEATURE_SPEC.md) · [DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md) · [API_SPEC.md](../API_SPEC.md) · [DECISIONS.md](../DECISIONS.md) · [checkout-and-payments.md](../architecture/checkout-and-payments.md) · [auth-and-roles.md](../architecture/auth-and-roles.md) · [catalog-and-search.md](../architecture/catalog-and-search.md)

## 1. Purpose

This document is the customer and visitor source of truth for the marketplace MVP. It defines the complete demand-side journey: how visitors browse, how customers authenticate, how accounts, addresses, carts, coupons, checkout, payment, orders, and fulfillment visibility should behave.

It is the customer-side counterpart to `02-seller-flow.md`. Together they cover the two halves of the marketplace product. Implementation, audit, and testing work should reference this blueprint before building or changing customer-facing behavior.

## 2. Scope

In scope for customer MVP:

- Visitor storefront browsing and product discovery.
- Customer sign-up, sign-in, sign-out, and auth callback.
- Customer account summary and profile editing.
- Customer address management (CRUD, default selection).
- Product listing, search, filter, sort, pagination.
- Product detail display and add-to-cart.
- Authenticated cart lifecycle.
- Coupon application and removal.
- Server-authoritative checkout.
- Stripe Checkout redirect payment flow.
- Customer order history and order detail.
- Fulfillment and tracking visibility for customers.
- Customer-facing status language.
- Security and ownership rules.
- Database, API, and route impact previews.
- Edge cases and acceptance criteria.

Out-of-scope items are listed in section 26.

## 3. Customer/visitor roles

### Visitor

An unauthenticated person browsing the public storefront. Visitors can discover products but cannot purchase, manage a persistent cart, or access account features.

### Customer

An authenticated user with `role = customer` (the default role). A customer can browse, manage cart, checkout, view orders, and manage their own profile and addresses.

### Customer who is also a seller

A customer may later apply to sell via `/seller/register`. The customer flow documented here remains unchanged — the seller overlay adds capabilities but does not alter the buying journey.

### Admin viewing as customer

Admins retain customer purchasing capability but access admin tools through separate routes. This blueprint does not cover admin-specific behavior.

## 4. Terminology

| Term | Meaning |
|---|---|
| Visitor | Unauthenticated browser user |
| Customer | Authenticated user with default `customer` role |
| Cart | Server-persisted mutable pre-purchase container (one per user) |
| Checkout | Server-authoritative flow converting cart into pending order + payment session |
| Pending order | Order created before payment confirmation, `order_status = pending` |
| Confirmed order | Order after webhook-verified payment, `order_status = confirmed` |
| Snapshot | Immutable copy of product/address data frozen at order creation time |
| Fulfillment | Seller-driven shipment lifecycle on `order_items` |
| Provisional total | Client-displayed cart total that is not checkout-final |

## 5. Visitor storefront journey

### What a visitor can do

- Browse the homepage / storefront product sections.
- Browse the product listing page.
- Search products by keyword (fuzzy, alias-aware).
- Filter products by category, price range, and other supported facets.
- Sort products (newest, price asc/desc, relevance).
- View product detail pages for active, publicly visible products.
- See seller/store label on product cards and detail pages.
- Navigate to `/sign-up` or `/sign-in`.
- Navigate to `/sell` (public seller landing page).

### What a visitor cannot do

- Add items to a persistent server-side cart (cart requires authentication).
- Proceed to checkout.
- View order history.
- Manage account, profile, or addresses.
- Access `/seller/*` operational routes.
- Access `/admin/*` routes.

### Guest cart decision

The current application uses an authenticated cart model (`carts.user_id` is required). Guest/anonymous cart is **deferred to a future phase**. If guest cart is added later, it should merge into the authenticated cart on sign-in without duplicating items.

### Visibility rules (server-enforced)

Products appear publicly only when **all** conditions are met:

- `products.status = 'active'`
- `seller_profiles.status = 'approved'`
- `categories.is_active = true` (if category visibility is enforced)
- Product is not suspended by admin

Draft, archived, and suspended products never appear in public listing or search results. This filtering must happen in the query layer, not only in UI rendering.

## 6. Customer authentication journey

### Sign up

- Route: `/sign-up`
- Provider: Supabase Auth (email + password for MVP).
- On success: `auth.users` row created, DB trigger creates `public.profiles` row with `role = 'customer'`.
- Redirect: to `/account` or the page the user came from.
- Edge case: if the profile trigger fails, `ensureProfileForUser()` reconciliation layer catches it.

### Sign in

- Route: `/sign-in`
- Provider: Supabase Auth.
- On success: session established, redirect to previous page or `/account`.
- Invalid credentials: show clear error, do not disclose whether email exists.

### Sign out

- Available from header/account menu.
- Clears Supabase session.
- Redirects to `/` or `/sign-in`.

### Auth callback

- Route: `/auth/callback`
- Handles Supabase auth redirects (email confirmation, OAuth if added later).
- On success: redirect to intended destination.
- On failure: redirect to `/sign-in` with error message.

### Redirect after login

- If the user was attempting to reach a protected page (cart, checkout, orders, account), redirect back after successful auth.
- Default post-login destination: `/account`.

### Access denied behavior

- Unauthenticated user visiting a protected route: redirect to `/sign-in` with return URL.
- Authenticated user visiting a role-restricted route they lack access to: show 403 or redirect to `/account`.

## 7. Customer account journey

### Route: `/account`

The account page is the customer's home base. It should be a clean summary, not a confusing system map.

MVP account page should display:

- **Account summary**: user's email and full name.
- **Profile section**: link to `/account/profile` for editing.
- **Address book**: link to `/account/addresses`.
- **Order history**: link to `/orders`.
- **Seller entry**: "Become a Seller" or "Seller Dashboard" link based on seller state.
- **Admin entry**: "Admin Dashboard" link, visible only for `role = admin`.

### Navigation structure

```
/account           -> account summary / hub
/account/profile   -> profile editing
/account/addresses -> address management
/orders            -> order history
/orders/[id]       -> order detail
```

## 8. Customer profile rules

### Viewable fields

- Email (read-only, sourced from auth provider).
- Full name.
- Role (read-only, displayed as badge or label).
- Account created date.

### Editable fields (MVP)

- Full name (`profiles.full_name`).

### Rules

- Profile updates go through a server action that derives `user_id` from the session.
- Customer cannot change their own email through the profile form (email changes go through auth provider flow if supported later).
- Customer cannot change their own role.
- `updated_at` must be set on every profile mutation.

## 9. Address management flow

### Route: `/account/addresses`

### MVP capabilities

| Action | Description |
|---|---|
| List | Show all saved addresses for the authenticated user |
| Create | Add a new address |
| Edit | Update an existing address |
| Delete | Remove an address (hard delete acceptable for MVP since orders use snapshots) |
| Set default | Mark one address as the default shipping address |

### Address fields

| Field | Required | Notes |
|---|---|---|
| `recipient_name` | Yes | Name on the shipment |
| `line_1` | Yes | Street address |
| `line_2` | No | Apt, suite, etc. |
| `city` | Yes | |
| `state_region` | No | State/province/region |
| `postal_code` | No | ZIP/postal code |
| `country_code` | Yes | ISO 3166-1 alpha-2 |
| `phone` | No | Contact phone for delivery |
| `label` | No | e.g. "Home", "Office" |
| `is_default` | Auto | Only one default per user |

### Default address rules

- Setting a new default must unset the previous default (single-default model).
- If the only address is deleted, no default exists.
- Checkout should pre-select the default address if one exists.

### Snapshot rule

When an order is placed, the selected address is copied into `orders.shipping_address_snapshot` (JSONB). Subsequent address edits do not affect historical orders.

### Implementation status

Address management is **not currently implemented**. The `addresses` table is defined in `DATABASE_SCHEMA.md` and the API contract exists in `API_SPEC.md`. This is a **required implementation for the next phase**.

**Priority note**: Address CRUD is the highest-priority missing customer feature because checkout cannot populate `shipping_address_snapshot` without it. Profile editing (`full_name`) is a smaller gap that can ship alongside addresses.

## 10. Product discovery flow

### Homepage

- Displays curated product sections (e.g., featured, new arrivals).
- Products shown are server-filtered to active/visible only.
- Links to full product listing.

### Product listing page

- Route: `/products` (or current listing route).
- Shows paginated grid of product cards.
- Each card: thumbnail, title, price, seller store name, category.

### Search

- Keyword search with fuzzy matching (`pg_trgm`).
- Autocomplete/typeahead with debounced requests.
- Search returns only publicly visible products.
- Empty search returns default listing.

### Category browsing

- Filter by category slug or ID.
- Only active categories shown in filter UI.

### Filtering (MVP)

- Category.
- Price range (min/max).

### Sorting

| Sort option | Key |
|---|---|
| Relevance | `relevance` |
| Newest | `newest` |
| Price: Low to High | `price_asc` |
| Price: High to Low | `price_desc` |

Default sort: `newest` for browsing, `relevance` for search.

### Pagination

- Page-based pagination with bounded page size (default 20, max 50).

### Empty results

- Friendly empty-state message suggesting clearing filters or broadening search.

### Unavailable products

- Hidden from queries server-side.
- Stale links to hidden products show a not-found page.

## 11. Product detail flow

### Route: `/products/[slug]`

### Required display fields

| Field | Source |
|---|---|
| Title | `products.title` |
| Images | `product_images` sorted by `sort_order` |
| Description | `products.description` |
| Price | `products.price_amount` + `currency_code` |
| Category | `categories.name` |
| Seller/store | `seller_profiles.store_name` |
| Availability | Derived from stock fields |
| Related products | Catalog query (same category or similar) |

### Stock messaging

| Condition | Customer sees |
|---|---|
| Unlimited stock | In Stock |
| Limited stock, qty > low threshold | In Stock |
| Limited stock, 0 < qty <= threshold | Low Stock / "Only X left" |
| Limited stock, qty = 0 | Out of Stock |

### Add-to-cart behavior

- Button visible to visitors but action requires authentication.
- Visitor clicks "Add to Cart": redirect to `/sign-in` with return URL.
- Signed-in customer: server action adds item to cart.
- Out-of-stock: add-to-cart button disabled with "Out of Stock" label.
- Draft/archived/suspended products: page returns 404, no add-to-cart shown.

### Rules

- Product detail must not leak hidden status names to customers.
- If product becomes unavailable after page load, the add-to-cart server action rejects with a clear message.

## 12. Cart flow

### Route: `/cart`

### Prerequisites

- Customer must be authenticated.
- Unauthenticated user visiting `/cart`: redirect to `/sign-in`.

### MVP cart capabilities

| Action | Behavior |
|---|---|
| View cart | Show all items with current product info |
| Add item | Create or increment `cart_items` row |
| Update quantity | Change quantity (validated > 0, within stock) |
| Remove item | Delete `cart_items` row |
| Clear cart | Remove all items |
| Subtotal | Show provisional subtotal |
| Coupon preview | Show discount if valid coupon applied |
| Unavailable items | Flag items no longer purchasable |

### Cart data model

- `carts`: one row per user (`user_id` unique).
- `cart_items`: one row per (cart, product) pair.
- `carts.coupon_id`: references currently applied coupon.

### Rules

- Cart totals are **provisional**. Final totals computed at checkout.
- Cart ownership enforced server-side via session `user_id`.
- Product availability rechecked when cart is loaded.
- Quantity validated server-side: > 0 and within stock for limited-stock products.
- Adding same product again increments quantity (upsert on `cart_id + product_id`).
- Price shown reflects current `products.price_amount`.

### Unavailable item handling

If a product becomes unavailable (archived, suspended, out-of-stock, seller suspended):

- Show warning badge on the item.
- Prevent that item from proceeding to checkout.
- Customer can remove the item manually.
- Checkout revalidation catches any remaining invalid items.

## 13. Coupon flow

### Apply coupon

- Customer enters coupon code in cart or checkout.
- Server validates: exists, active, date window, minimum order, usage limits.
- On success: `carts.coupon_id` set; discount preview shown.
- On failure: clear error message.

### Remove coupon

- Customer can remove the applied coupon.
- `carts.coupon_id` set to null; discount preview removed.

### Discount preview

- Show coupon code, type (fixed/percentage), and calculated discount.
- Label as "Estimated discount" — advisory, not final.

### Checkout revalidation

- Coupon revalidated during checkout against current cart state.
- If invalid at checkout time, checkout rejects with clear message.
- Customer can remove invalid coupon and retry.

### Snapshot rule

- `orders.coupon_id` set and per-line `order_items.discount_amount` persisted at order creation.
- Later coupon changes do not affect completed orders.

### Rules

- Coupon validation is always server-side.
- No coupon stacking in MVP.

## 14. Checkout flow

### Route: `/checkout`

### Prerequisites

- Authenticated customer.
- Non-empty cart with at least one valid item.

### Checkout sequence

1. Customer clicks "Proceed to Checkout" from cart.
2. Server loads cart, products, coupon from DB (not from client).
3. Server validates all items, quantities, stock, coupon, prices.
4. Server computes totals: subtotal, discount, tax (0 for MVP), total.
5. Server creates pending order with snapshot-backed order items.
6. Server creates Stripe Checkout session with `total_amount`.
7. Server clears the cart (per D-015 decision).
8. Server returns Stripe `checkout_url` to client.
9. Client redirects to Stripe Checkout.

### Address in checkout

- When address management is implemented, checkout allows selecting a saved address.
- Address is snapshotted into `orders.shipping_address_snapshot`.
- MVP decision: address selection may be deferred. See open questions.

### Rules

- Do not trust client-submitted totals, prices, or discount amounts.
- Checkout should be idempotent where practical (reuse existing pending order if one exists).
- Invalid cart state returns clear error, no partial orders created.
- Cart cleared after pending order creation, before payment (D-015 tradeoff).

### Design rationale (D-015)

Cart is cleared immediately after pending-order creation to avoid complexity around partial cart states and order-cart mismatches. If the customer cancels Stripe Checkout, they must rebuild the cart. This is an accepted MVP simplification. A future enhancement could restore cart items from a failed/cancelled pending order.

### Validation errors

| Condition | Response |
|---|---|
| Empty cart | `409 CART_EMPTY` |
| Product unavailable | `409 PRODUCT_UNAVAILABLE` |
| Stock exceeded | `409 PRODUCT_UNAVAILABLE` with detail |
| Invalid coupon | `400 INVALID_COUPON` |
| Not authenticated | `401 UNAUTHORIZED` |

## 15. Stripe payment flow

### Customer-facing sequence

1. Customer clicks "Checkout" and is redirected to Stripe Checkout.
2. Customer enters payment details on Stripe's hosted page.
3. On payment success: Stripe redirects to `/checkout/success`.
4. On cancel: Stripe redirects to `/checkout/cancel`.

### Server-side confirmation

- Stripe webhook (`checkout.session.completed`) is the authoritative payment signal.
- Webhook handler updates `payments.status = 'paid'`, `orders.payment_status = 'paid'`, `orders.order_status = 'confirmed'`.
- Webhook is idempotent: payments already in terminal state are not re-processed.

### Success page (`/checkout/success`)

- Shows confirmation-safe wording: "Your payment is being confirmed" or "Order received".
- Do **not** say "Payment complete" until server/webhook confirmation is durable.
- Links to order detail page.

### Cancel page (`/checkout/cancel`)

- Shows "Payment was not completed" message.
- Offers link to start a new cart or view pending orders.
- The pending order remains in `pending`/`unpaid` state.

### Payment status transitions (per D-015)

| Event | `payments.status` | `orders.payment_status` | `orders.order_status` |
|---|---|---|---|
| Pending order created | _(no row)_ | `unpaid` | `pending` |
| Stripe session created | `processing` | `unpaid` | `pending` |
| Webhook: session.completed | `paid` | `paid` | `confirmed` |
| Webhook: session.expired | `failed` | `failed` | `pending` |

### Failed payment

- Order remains `pending`/`failed`.
- Customer can retry from order detail (future enhancement) or create a new cart.

## 16. Order history flow

### Route: `/orders`

### Order list display

| Field | Source |
|---|---|
| Order number | `orders.order_number` |
| Order date | `orders.placed_at` or `created_at` |
| Order status | Customer-facing label (see section 19) |
| Payment status | Customer-facing label (see section 19) |
| Total | `orders.total_amount` + `currency_code` |
| Action | "View Details" link to `/orders/[id]` |

### Rules

- Only shows orders owned by the authenticated customer (`customer_id` from session).
- Ordered by most recent first.
- Paginated if order count grows.

## 17. Order detail flow

### Route: `/orders/[id]`

### Order detail display

| Section | Fields |
|---|---|
| Header | Order number, order date |
| Status | Order status label, payment status label |
| Items | Product title snapshot, quantity, unit price, line total, discount if any |
| Seller | Store name per line item |
| Totals | Subtotal, discount, tax, total |
| Address | Shipping address snapshot (if available) |
| Fulfillment | Per-item fulfillment status, tracking code, shipment note |

### Rules

- Customer can only view their own orders (ownership enforced server-side).
- Display uses snapshot data from `order_items`, not live product data.
- Customer cannot modify payment or order statuses.

## 18. Fulfillment/tracking visibility

### What the customer sees

Fulfillment status is per-item (on `order_items`), reflecting seller-driven updates.

| Internal status | Customer label |
|---|---|
| `unfulfilled` | Preparing your order |
| `processing` | Processing |
| `shipped` | Shipped |
| `delivered` | Delivered |
| `cancelled` | Cancelled |

### Tracking information

- If `order_items.tracking_code` is set, show it to the customer.
- If `order_items.shipment_note` is set, show it to the customer.
- Do not expose seller internal notes or admin-only data.

### Multi-vendor orders

- Each seller's items may be at different fulfillment stages.
- Customer sees per-item fulfillment status, not a single order-level status.
- Group items by seller in the order detail view for clarity.

## 19. Customer-facing status language

### Order status labels

| Internal value | Customer sees |
|---|---|
| `pending` | Order Received |
| `confirmed` | Order Confirmed |
| `processing` | Processing |
| `completed` | Completed |
| `cancelled` | Cancelled |
| `refunded` | Refunded |
| `partially_refunded` | Partially Refunded |

### Payment status labels

| Internal value | Customer sees |
|---|---|
| `unpaid` | Payment Pending |
| `processing` | Payment Processing |
| `paid` | Payment Confirmed |
| `failed` | Payment Failed |
| `refunded` | Refunded |
| `partially_refunded` | Partially Refunded |

### Fulfillment status labels

| Internal value | Customer sees |
|---|---|
| `unfulfilled` | Preparing Your Order |
| `processing` | Processing |
| `shipped` | Shipped |
| `delivered` | Delivered |
| `cancelled` | Cancelled |

### Rules

- Never show raw enum values to customers.
- Avoid technical/developer wording in the UI.
- Use consistent labels across order list, order detail, and email notifications (when added).

## 20. Security and ownership rules

### Identity

- Customer identity comes from the server-side Supabase session.
- `user_id` is derived from session, never from client input.

### Ownership enforcement

| Resource | Rule |
|---|---|
| Profile | Customer can only view/edit own profile |
| Addresses | Customer can only manage own addresses |
| Cart | Customer can only manage own cart |
| Orders | Customer can only view own orders |
| Order items | Visible only as part of own orders |

### Prohibited customer actions

- Cannot spoof `user_id` in requests.
- Cannot submit checkout totals from client.
- Cannot claim payment success without webhook verification.
- Cannot access seller dashboard without seller role + approved status.
- Cannot access admin dashboard without admin role.
- Cannot view other customers' orders, profiles, or addresses.
- Cannot modify order status or payment status.

### Server enforcement

All of the above must be enforced server-side. UI visibility (hiding links/buttons) is for UX only, not security.

## 21. Database impact preview

| Area | Table(s) | Status |
|---|---|---|
| User profiles | `profiles` | Implemented (DB trigger bootstrap) |
| Addresses | `addresses` | Schema defined, **not yet implemented in app** |
| Categories | `categories` | Implemented |
| Products | `products`, `product_images` | Implemented |
| Carts | `carts`, `cart_items` | Implemented |
| Coupons | `coupons` | Implemented (admin-managed) |
| Orders | `orders`, `order_items` | Implemented (snapshot-backed) |
| Payments | `payments` | Implemented (Stripe webhook flow) |
| Seller visibility | `seller_profiles` | Implemented (status filtering in catalog) |
| Address snapshots | `orders.shipping_address_snapshot` | Column exists, **not populated yet** |
| Billing address | `orders.billing_address_snapshot` | Column exists, deferred |

### Needs audit

- `addresses` table: exists in schema doc but no app-level CRUD.
- `shipping_address_snapshot`: column exists but checkout does not populate it yet.
- Cart coupon revalidation: verify server-side enforcement is complete.
- Profile `full_name` editing: verify server action exists and is ownership-safe.

## 22. Server action/API impact preview

| Operation | Endpoint / Action | Status |
|---|---|---|
| Profile update | Server action or `PATCH /api/me` | Needs implementation or audit |
| Address CRUD | `GET/POST/PATCH/DELETE /api/me/addresses` | **Not implemented** |
| Address set default | `PATCH /api/me/addresses/:id` | **Not implemented** |
| Cart view | `GET /api/cart` | Implemented |
| Cart add item | `POST /api/cart/items` | Implemented |
| Cart update qty | `PATCH /api/cart/items/:id` | Implemented |
| Cart remove item | `DELETE /api/cart/items/:id` | Implemented |
| Coupon apply | `POST /api/cart/apply-coupon` | Implemented |
| Coupon remove | Server action or endpoint | Needs audit |
| Checkout start | `POST /api/checkout` | Implemented |
| Payment webhook | `POST /api/webhooks/stripe` | Implemented |
| Order list | `GET /api/orders` | Implemented |
| Order detail | `GET /api/orders/:id` | Implemented |

## 23. UI route/page map

| Route | Purpose | Auth | Status |
|---|---|---|---|
| `/` | Homepage / storefront | Public | Implemented |
| `/products` | Product listing | Public | Implemented (may use `/` currently) |
| `/products/[slug]` | Product detail | Public | Implemented |
| `/sign-up` | Customer registration | Public | Implemented |
| `/sign-in` | Customer login | Public | Implemented |
| `/auth/callback` | Auth redirect handler | Public | Implemented |
| `/account` | Account summary | Authenticated | Implemented (basic) |
| `/account/profile` | Profile editing | Authenticated | **Needs implementation** |
| `/account/addresses` | Address management | Authenticated | **Needs implementation** |
| `/cart` | Shopping cart | Authenticated | Implemented |
| `/checkout` | Checkout initiation | Authenticated | Implemented |
| `/checkout/success` | Post-payment success | Authenticated | Implemented |
| `/checkout/cancel` | Payment cancelled | Authenticated | Implemented |
| `/orders` | Order history | Authenticated | Implemented |
| `/orders/[id]` | Order detail | Authenticated | Implemented |
| `/sell` | Seller landing (public) | Public | Implemented |
| `/seller/register` | Seller application | Authenticated | Implemented |

## 24. Edge cases

### Authentication edge cases

- **Signed-out user tries to add to cart**: redirect to `/sign-in` with return URL to product page.
- **Signed-out user tries checkout**: redirect to `/sign-in` with return URL to `/cart`.
- **Session expires during checkout**: Stripe redirect may fail; customer can sign in and retry.

### Product availability edge cases

- **Product becomes unavailable after add-to-cart**: flag in cart view; block at checkout.
- **Product price changes before checkout**: checkout uses current price, not cart-cached price.
- **Product stock changes before checkout**: checkout validates stock; reject if insufficient.
- **Product archived after purchase**: order detail uses snapshot data; remains readable.

### Coupon edge cases

- **Coupon expires before checkout**: checkout revalidation rejects; customer removes coupon and retries.
- **Coupon disabled before checkout**: same as expiry behavior.
- **Coupon minimum not met after cart changes**: revalidation catches it.

### Payment edge cases

- **Payment succeeds but webhook is delayed**: success page shows "being confirmed"; order updates when webhook arrives.
- **Payment fails**: order stays `pending`/`failed`; customer can retry or start new cart.
- **Customer cancels Stripe checkout**: redirected to `/checkout/cancel`; pending order remains.
- **Webhook arrives twice**: idempotent handler ignores duplicate.

### Multi-vendor edge cases

- **Order contains products from multiple sellers**: each seller fulfills independently; customer sees per-item fulfillment.
- **Seller ships one item before another**: customer sees mixed fulfillment statuses grouped by seller.
- **Seller suspended after purchase**: existing orders remain readable; fulfillment may stall (admin intervention needed).

### Address edge cases

- **Address changes after order placed**: no effect on historical orders (snapshot-backed).
- **No addresses saved during checkout**: depends on whether address is required (see open questions).

## 25. Acceptance criteria

The customer MVP is complete when:

1. Visitor can browse the homepage and product listing with only active/visible products.
2. Visitor can search, filter by category, and sort products.
3. Visitor can view product detail pages with images, price, stock status, and seller info.
4. Customer can sign up and sign in via Supabase Auth.
5. Customer can view and edit basic profile (full name).
6. Customer can manage saved addresses (create, edit, delete, set default).
7. Customer can add available products to cart.
8. Customer can update quantities and remove items from cart.
9. Customer can apply and remove coupons with server-side validation.
10. Cart shows provisional totals and flags unavailable items.
11. Checkout recalculates all totals server-side.
12. Checkout creates snapshot-backed pending orders.
13. Stripe payment flow creates durable payment records.
14. Webhook confirmation transitions order to confirmed/paid.
15. Customer can view order history with status labels.
16. Customer can view order detail with item snapshots, totals, and fulfillment status.
17. Customer can see tracking codes and shipment notes when provided.
18. Customer cannot access other users' data (orders, profile, addresses, cart).
19. All ownership and authorization checks are server-side.
20. Customer-facing labels use clean, non-technical language.

## 26. Out of scope for customer MVP

The following are explicitly excluded unless already cleanly implemented:

- Guest checkout / anonymous cart.
- Wishlist.
- Reviews and ratings.
- Refund request portal.
- Dispute/chargeback management.
- Live chat or support center.
- Advanced product recommendations.
- Multi-address shipment splitting.
- Tax calculation engine.
- Loyalty points / rewards.
- Complex notification preferences.
- Email notification templates.
- Social login (OAuth providers beyond email/password).
- Saved payment methods.
- Order cancellation by customer (admin-only for MVP).

## 27. Open questions

1. **Should cart require login?** Current answer: yes (authenticated cart). Guest cart deferred.
2. **Should address be required before Stripe checkout?** Recommendation: yes for physical goods, but can be deferred to next phase if address CRUD is not ready.
3. **Should billing and shipping address be separate in MVP?** Recommendation: no, use one address for MVP. Add billing address later.
4. **Should customer phone be required for shipping?** Recommendation: optional in MVP.
5. **Should out-of-stock products remain visible?** Recommendation: yes, visible but not purchasable. Show "Out of Stock" label.
6. **Should customers be able to retry failed payments from order detail?** Recommendation: yes, but can be deferred to follow-up phase.
7. **Should order cancellation be admin-only for MVP?** Recommendation: yes. Customer-initiated cancellation adds refund complexity.
8. **Should checkout populate `shipping_address_snapshot`?** Yes, once address management is implemented.
9. **Is the current product listing route `/` or `/products`?** Audit needed to confirm current routing and decide target.
