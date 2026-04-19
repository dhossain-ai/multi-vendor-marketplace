## `docs/API_SPEC.md`

````md id="r6w2xd"
# API Specification

## Purpose

This document defines the intended API surface for the marketplace platform. It covers endpoint responsibilities, request/response contracts, authorization rules, validation requirements, mutation safety, and reliability expectations.

This API is designed for a modular monolith using Next.js server routes and a Supabase/PostgreSQL backend.

---

## API Design Principles

### 1. Server is the source of truth

The API must validate and enforce:

- authorization
- role access
- ownership boundaries
- pricing and totals
- coupon validity
- stock or availability checks
- order/payment state transitions

### 2. Clear read/write separation

Read endpoints should be optimized for:

- product listing
- product detail
- dashboard summaries
- order history

Write endpoints should be treated as high-sensitivity paths and require:

- validation
- authorization
- transaction-safe logic where needed
- idempotency for critical flows

### 3. Historical correctness

Order and payment endpoints must not rely on mutable live product state once purchase is recorded.

### 4. Explicit role boundaries

Roles:

- customer
- seller
- admin

Server-side checks are mandatory. UI visibility is not sufficient protection.

### 5. Safe retries

Sensitive mutation endpoints must tolerate duplicate requests or retries wherever practical.

---

## Conventions

## Base Path

Internal API routes are assumed to live under:

- `/api/...`

Legacy compatibility routes may exist where already implemented, such as `/list`.

---

## Content Type

For JSON endpoints:

- request: `application/json`
- response: `application/json`

Webhook endpoints may use provider-specific payload formats.

---

## Time Format

All timestamps should use ISO 8601 strings in UTC.

---

## Currency and Amounts

Recommended response format:

- store currency as `currency_code`
- return monetary values as strings or well-defined decimals to avoid floating-point ambiguity

Example:

```json
{
  "currency_code": "USD",
  "subtotal_amount": "49.99"
}
```
````

---

## Error Format

Recommended standard error response:

```json
{
  "error": {
    "code": "INVALID_COUPON",
    "message": "Coupon is invalid or expired.",
    "details": null
  }
}
```

### Error Object Fields

- `code`: stable machine-readable identifier
- `message`: human-readable message
- `details`: optional structured diagnostic payload

---

## Pagination Format

Recommended pagination contract for list endpoints:

```json
{
  "items": [],
  "page": 1,
  "page_size": 20,
  "total_items": 120,
  "total_pages": 6
}
```

Cursor pagination may be introduced later for hot paths if needed.

---

## Authentication and Authorization

## Authentication

Authenticated endpoints require a valid user session.

## Authorization

Server-side authorization must enforce:

- customer can access only own resources
- seller can access only seller-owned resources
- admin can access elevated operational endpoints

## Forbidden vs Not Found

Recommended rule:

- use `403` when caller is authenticated but not allowed
- use `404` when resource should not be disclosed or does not exist

---

## Idempotency Rules

## Required for Sensitive Operations

Recommended idempotency support for:

- checkout initiation
- payment session creation
- webhook processing
- refund operations if implemented later
- certain admin operations if high impact

## Idempotency Key

For applicable endpoints, accept:

- `Idempotency-Key` header

Server should:

- persist or derive idempotency safely
- return the same semantic result for duplicate retries where appropriate

---

## Rate Limiting Guidance

## Should Be Rate Limited

- search/autocomplete
- checkout initiation
- coupon validation if exposed separately
- auth-sensitive endpoints
- admin mutation endpoints
- webhook endpoints should be protected appropriately, but not blocked incorrectly

---

# Endpoint Groups

- public catalog
- authenticated customer
- seller
- admin
- payment/webhooks
- health/internal if needed

---

# 1. Public Catalog Endpoints

## GET `/list`

### Status

Currently implemented legacy/public listing endpoint.

### Purpose

Returns a list of products/offers for public browsing and search.

### Query Params

- `search` string optional
- `limit` integer optional

### Behavior

- no `search` returns default listing
- `search` performs title/query-based search
- fuzzy search may use RPC-backed logic
- `limit` may be used for autocomplete or constrained listing

### Auth

- public

### Response 200

```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Example Product",
      "slug": "example-product",
      "price_amount": "29.99",
      "currency_code": "USD",
      "thumbnail_url": "https://...",
      "seller": {
        "id": "uuid",
        "store_name": "Example Store"
      }
    }
  ]
}
```

### Validation Rules

- invalid `limit` should fail safely or clamp to allowed bounds
- invalid search input must not break the endpoint

### Edge Cases

- empty search
- malformed search
- no results
- archived/suspended products should not be returned in normal customer listing

### Notes

This route may later remain as a compatibility alias to a more explicit product listing endpoint.

---

## GET `/api/products`

### Purpose

Primary product listing endpoint for customer-facing catalog pages.

### Query Params

- `search` string optional
- `category` string optional
- `seller` string optional
- `min_price` string optional
- `max_price` string optional
- `sort` string optional
- `page` integer optional
- `page_size` integer optional

### Auth

- public

### Allowed Sort Values

Recommended:

- `relevance`
- `newest`
- `price_asc`
- `price_desc`
- `rating`
- `popularity`

### Response 200

```json
{
  "items": [
    {
      "id": "uuid",
      "slug": "example-product",
      "title": "Example Product",
      "short_description": "Short summary",
      "price_amount": "29.99",
      "currency_code": "USD",
      "thumbnail_url": "https://...",
      "status": "active",
      "seller": {
        "id": "uuid",
        "store_name": "Example Store",
        "slug": "example-store"
      },
      "category": {
        "id": "uuid",
        "name": "Action",
        "slug": "action"
      }
    }
  ],
  "page": 1,
  "page_size": 20,
  "total_items": 120,
  "total_pages": 6
}
```

### Validation Rules

- page and page_size must be bounded
- sort must be one of allowed values
- numeric filters must parse safely
- invalid combinations should return `400` if nonsensical

### Possible Errors

- `400 INVALID_QUERY_PARAMS`

### Notes

This endpoint should be optimized for high-read traffic and avoid unnecessary heavy joins.

---

## GET `/api/products/:slug`

### Purpose

Returns full product detail view for a public/customer-facing product page.

### Auth

- public

### Response 200

```json
{
  "id": "uuid",
  "slug": "example-product",
  "title": "Example Product",
  "description": "Long description",
  "price_amount": "29.99",
  "currency_code": "USD",
  "status": "active",
  "stock_quantity": 10,
  "is_unlimited_stock": false,
  "thumbnail_url": "https://...",
  "images": [
    {
      "id": "uuid",
      "image_url": "https://...",
      "alt_text": "Example image",
      "sort_order": 0
    }
  ],
  "seller": {
    "id": "uuid",
    "store_name": "Example Store",
    "slug": "example-store"
  },
  "category": {
    "id": "uuid",
    "name": "Action",
    "slug": "action"
  },
  "related_products": []
}
```

### Possible Errors

- `404 PRODUCT_NOT_FOUND`
- `410 PRODUCT_UNAVAILABLE` optional if intentionally exposed
- `403` generally should not be used for public product detail unless protected for specific reason

### Rules

- draft/suspended products should not be shown publicly
- archived products may be hidden or shown as unavailable depending on product policy

---

## GET `/api/search/suggestions`

### Purpose

Provides typeahead/autocomplete suggestions.

### Query Params

- `q` string required
- `limit` integer optional

### Auth

- public

### Response 200

```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Red Dead Redemption 2",
      "slug": "red-dead-redemption-2"
    }
  ]
}
```

### Validation Rules

- `q` must not be empty after normalization
- very short queries may return empty array or stricter results
- `limit` should be bounded tightly

### Possible Errors

- `400 INVALID_QUERY_PARAMS`

### Notes

Must be rate-limited and debounced on client side.

---

# 2. Customer Auth Endpoints

## GET `/api/me`

### Purpose

Returns authenticated user profile and role information.

### Auth

- authenticated user

### Response 200

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "Example User",
  "role": "customer",
  "is_active": true
}
```

### Possible Errors

- `401 UNAUTHORIZED`

---

## GET `/api/me/addresses`

### Purpose

Returns saved addresses for the current user.

### Auth

- authenticated user

### Response 200

```json
{
  "items": [
    {
      "id": "uuid",
      "label": "Home",
      "recipient_name": "Example User",
      "line_1": "123 Main St",
      "city": "Vilnius",
      "country_code": "LT",
      "is_default": true
    }
  ]
}
```

---

## POST `/api/me/addresses`

### Purpose

Creates a saved address for the current user.

### Auth

- authenticated user

### Request Body

```json
{
  "label": "Home",
  "recipient_name": "Example User",
  "line_1": "123 Main St",
  "line_2": null,
  "city": "Vilnius",
  "state_region": null,
  "postal_code": "12345",
  "country_code": "LT",
  "phone": "+370..."
}
```

### Response 201

```json
{
  "id": "uuid"
}
```

### Possible Errors

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`

---

## PATCH `/api/me/addresses/:id`

### Purpose

Updates a saved address owned by the current user.

### Auth

- authenticated user

### Possible Errors

- `401 UNAUTHORIZED`
- `403 FORBIDDEN`
- `404 ADDRESS_NOT_FOUND`

---

## DELETE `/api/me/addresses/:id`

### Purpose

Deletes or archives a saved address owned by the current user.

### Auth

- authenticated user

### Response 204

No content.

---

# 3. Cart Endpoints

## GET `/api/cart`

### Purpose

Returns the current authenticated user's cart.

### Auth

- authenticated user

### Response 200

```json
{
  "id": "uuid",
  "items": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "slug": "example-product",
      "title": "Example Product",
      "thumbnail_url": "https://...",
      "quantity": 1,
      "unit_price_amount": "29.99",
      "currency_code": "USD",
      "line_total_amount": "29.99",
      "availability": {
        "is_available": true,
        "reason": null
      }
    }
  ],
  "subtotal_amount": "29.99",
  "currency_code": "USD"
}
```

### Rules

- totals returned here are informational, not final checkout truth
- availability flags may reflect current product state

---

## POST `/api/cart/items`

### Purpose

Adds an item to the cart or increments quantity if item already exists.

### Auth

- authenticated user

### Request Body

```json
{
  "product_id": "uuid",
  "quantity": 1
}
```

### Response 201

```json
{
  "cart_item_id": "uuid"
}
```

### Possible Errors

- `400 VALIDATION_ERROR`
- `404 PRODUCT_NOT_FOUND`
- `409 PRODUCT_UNAVAILABLE`
- `401 UNAUTHORIZED`

### Rules

- quantity must be > 0
- server validates product is purchasable
- this endpoint does not finalize stock reservation unless explicitly designed later

---

## PATCH `/api/cart/items/:id`

### Purpose

Updates cart item quantity.

### Auth

- authenticated user

### Request Body

```json
{
  "quantity": 2
}
```

### Response 200

```json
{
  "cart_item_id": "uuid",
  "quantity": 2
}
```

### Possible Errors

- `400 VALIDATION_ERROR`
- `404 CART_ITEM_NOT_FOUND`
- `409 PRODUCT_UNAVAILABLE`

---

## DELETE `/api/cart/items/:id`

### Purpose

Removes an item from the cart.

### Auth

- authenticated user

### Response 204

No content.

---

## POST `/api/cart/apply-coupon`

### Purpose

Validates and previews coupon application against the current cart.

### Auth

- authenticated user

### Request Body

```json
{
  "coupon_code": "SAVE10"
}
```

### Response 200

```json
{
  "coupon": {
    "code": "SAVE10",
    "type": "percentage",
    "value_amount": "10.00"
  },
  "discount_amount": "5.00",
  "subtotal_amount": "50.00",
  "total_amount": "45.00",
  "currency_code": "USD"
}
```

### Possible Errors

- `400 INVALID_COUPON`
- `409 COUPON_NOT_APPLICABLE`
- `401 UNAUTHORIZED`

### Rules

- this is advisory
- final coupon validation must still occur during checkout

---

# 4. Checkout and Order Endpoints

## POST `/api/checkout`

### Purpose

Validates cart, creates pending order or order intent, and creates payment session.

### Auth

- authenticated user with customer-capable role

### Idempotency

- required or strongly recommended
- accepts `Idempotency-Key` header

### Request Body

```json
{
  "address_id": "uuid",
  "coupon_code": "SAVE10"
}
```

### Response 200

```json
{
  "order_id": "uuid",
  "order_number": "ORD-20260101-0001",
  "order_status": "pending",
  "payment_status": "processing",
  "checkout": {
    "provider": "stripe",
    "session_id": "cs_test_123",
    "checkout_url": "https://checkout.example.com/session"
  }
}
```

### Validation Rules

- revalidate all cart items
- revalidate price/totals
- revalidate coupon
- reject unavailable items
- snapshot order item data
- create order/payment records safely
- protect against duplicate requests

### Possible Errors

- `400 VALIDATION_ERROR`
- `400 INVALID_COUPON`
- `401 UNAUTHORIZED`
- `404 ADDRESS_NOT_FOUND`
- `409 CART_EMPTY`
- `409 PRODUCT_UNAVAILABLE`
- `409 CHECKOUT_CONFLICT`

### Notes

Do not trust client-side totals.

---

## GET `/api/orders`

### Purpose

Returns authenticated user's order history.

### Auth

- authenticated user

### Query Params

- `page` optional
- `page_size` optional
- `status` optional

### Response 200

```json
{
  "items": [
    {
      "id": "uuid",
      "order_number": "ORD-20260101-0001",
      "order_status": "confirmed",
      "payment_status": "paid",
      "total_amount": "49.99",
      "currency_code": "USD",
      "placed_at": "2026-01-01T10:00:00Z"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total_items": 1,
  "total_pages": 1
}
```

---

## GET `/api/orders/:id`

### Purpose

Returns one order owned by the authenticated customer.

### Auth

- authenticated user

### Response 200

```json
{
  "id": "uuid",
  "order_number": "ORD-20260101-0001",
  "order_status": "confirmed",
  "payment_status": "paid",
  "subtotal_amount": "45.00",
  "discount_amount": "5.00",
  "tax_amount": "0.00",
  "total_amount": "40.00",
  "currency_code": "USD",
  "items": [
    {
      "id": "uuid",
      "product_title_snapshot": "Example Product",
      "unit_price_amount": "45.00",
      "quantity": 1,
      "line_total_amount": "40.00",
      "seller": {
        "id": "uuid",
        "store_name": "Example Store"
      }
    }
  ],
  "placed_at": "2026-01-01T10:00:00Z"
}
```

### Possible Errors

- `401 UNAUTHORIZED`
- `403 FORBIDDEN`
- `404 ORDER_NOT_FOUND`

---

# 5. Wishlist Endpoints

## GET `/api/wishlist`

### Purpose

Returns current user's wishlist.

### Auth

- authenticated user

### Response 200

```json
{
  "items": [
    {
      "product_id": "uuid",
      "slug": "example-product",
      "title": "Example Product",
      "thumbnail_url": "https://..."
    }
  ]
}
```

---

## POST `/api/wishlist/items`

### Purpose

Adds a product to wishlist.

### Auth

- authenticated user

### Request Body

```json
{
  "product_id": "uuid"
}
```

### Response 201

```json
{
  "product_id": "uuid"
}
```

---

## DELETE `/api/wishlist/items/:productId`

### Purpose

Removes a product from wishlist.

### Auth

- authenticated user

### Response 204

No content.

---

# 6. Review Endpoints

## GET `/api/products/:slug/reviews`

### Purpose

Returns visible reviews for a product.

### Auth

- public

### Response 200

```json
{
  "items": [
    {
      "id": "uuid",
      "rating": 5,
      "title": "Great product",
      "body": "Worked well.",
      "author": {
        "display_name": "Example User"
      },
      "created_at": "2026-01-01T10:00:00Z"
    }
  ]
}
```

---

## POST `/api/products/:slug/reviews`

### Purpose

Creates a review for an eligible customer.

### Auth

- authenticated user

### Request Body

```json
{
  "rating": 5,
  "title": "Great product",
  "body": "Worked well."
}
```

### Response 201

```json
{
  "review_id": "uuid"
}
```

### Validation Rules

- user must be eligible to review based on order policy
- rating must be bounded
- duplicate review policy must be enforced

### Possible Errors

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `403 REVIEW_NOT_ALLOWED`
- `409 DUPLICATE_REVIEW`

---

# 7. Seller Endpoints

## GET `/api/seller/me`

### Purpose

Returns current authenticated seller profile.

### Auth

- authenticated seller

### Response 200

```json
{
  "seller_id": "uuid",
  "store_name": "Example Store",
  "slug": "example-store",
  "status": "approved"
}
```

### Possible Errors

- `401 UNAUTHORIZED`
- `403 SELLER_ROLE_REQUIRED`

---

## GET `/api/seller/dashboard/summary`

### Purpose

Returns high-level seller dashboard metrics.

### Auth

- authenticated seller

### Response 200

```json
{
  "total_products": 12,
  "active_products": 10,
  "pending_orders": 3,
  "gross_sales_amount": "1200.00",
  "estimated_net_amount": "1080.00",
  "currency_code": "USD"
}
```

### Notes

Metrics may be eventually consistent if reporting becomes heavier later.

---

## GET `/api/seller/products`

### Purpose

Returns products owned by the current seller.

### Auth

- authenticated seller

### Query Params

- `status` optional
- `page` optional
- `page_size` optional

### Response 200

```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Example Product",
      "slug": "example-product",
      "status": "active",
      "price_amount": "29.99",
      "updated_at": "2026-01-01T10:00:00Z"
    }
  ]
}
```

---

## POST `/api/seller/products`

### Purpose

Creates a new seller-owned product.

### Auth

- authenticated seller with approved status

### Request Body

```json
{
  "title": "Example Product",
  "slug": "example-product",
  "category_id": "uuid",
  "description": "Long description",
  "short_description": "Short summary",
  "price_amount": "29.99",
  "currency_code": "USD",
  "stock_quantity": 10,
  "is_unlimited_stock": false,
  "thumbnail_url": "https://...",
  "metadata": {}
}
```

### Response 201

```json
{
  "product_id": "uuid"
}
```

### Possible Errors

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `403 SELLER_ROLE_REQUIRED`
- `409 DUPLICATE_SLUG`

### Rules

- seller ownership derived from auth context, not client input
- admin-only fields must not be accepted

---

## GET `/api/seller/products/:id`

### Purpose

Returns one product owned by the current seller.

### Auth

- authenticated seller

### Possible Errors

- `403 FORBIDDEN`
- `404 PRODUCT_NOT_FOUND`

---

## PATCH `/api/seller/products/:id`

### Purpose

Updates a seller-owned product.

### Auth

- authenticated seller

### Request Body

Partial update allowed.

### Validation Rules

- seller must own product
- status transitions may be restricted
- changing price does not affect historical orders

### Possible Errors

- `400 VALIDATION_ERROR`
- `403 FORBIDDEN`
- `404 PRODUCT_NOT_FOUND`
- `409 DUPLICATE_SLUG`

---

## DELETE `/api/seller/products/:id`

### Purpose

Archives seller-owned product rather than hard deleting it.

### Auth

- authenticated seller

### Response 204

No content.

### Rules

- recommended behavior is archive/soft delete
- historical order references must remain valid

---

## GET `/api/seller/orders`

### Purpose

Returns order items or seller-relevant order views for the current seller.

### Auth

- authenticated seller

### Query Params

- `status` optional
- `page` optional
- `page_size` optional

### Response 200

```json
{
  "items": [
    {
      "order_id": "uuid",
      "order_number": "ORD-20260101-0001",
      "order_status": "confirmed",
      "payment_status": "paid",
      "line_item_id": "uuid",
      "product_title_snapshot": "Example Product",
      "quantity": 1,
      "line_total_amount": "40.00",
      "currency_code": "USD",
      "placed_at": "2026-01-01T10:00:00Z"
    }
  ]
}
```

### Rules

- seller must only see seller-owned order items or appropriately derived seller-scoped views
- cross-seller data leakage is unacceptable

---

# 8. Admin Endpoints

## GET `/api/admin/dashboard/summary`

### Purpose

Returns high-level platform metrics for admin users.

### Auth

- authenticated admin

### Response 200

```json
{
  "total_customers": 100,
  "total_sellers": 12,
  "pending_seller_applications": 2,
  "active_products": 240,
  "orders_today": 15,
  "gross_revenue_amount": "2500.00",
  "platform_commission_amount": "250.00",
  "currency_code": "USD"
}
```

### Possible Errors

- `401 UNAUTHORIZED`
- `403 ADMIN_ROLE_REQUIRED`

---

## GET `/api/admin/sellers`

### Purpose

Lists sellers for review and management.

### Auth

- authenticated admin

### Query Params

- `status` optional
- `page` optional
- `page_size` optional

### Response 200

```json
{
  "items": [
    {
      "seller_id": "uuid",
      "store_name": "Example Store",
      "status": "pending",
      "created_at": "2026-01-01T10:00:00Z"
    }
  ]
}
```

---

## PATCH `/api/admin/sellers/:id/status`

### Purpose

Approves, rejects, or suspends a seller.

### Auth

- authenticated admin

### Request Body

```json
{
  "status": "approved",
  "reason": "Application reviewed and approved."
}
```

### Response 200

```json
{
  "seller_id": "uuid",
  "status": "approved"
}
```

### Possible Errors

- `400 INVALID_STATUS_TRANSITION`
- `401 UNAUTHORIZED`
- `403 ADMIN_ROLE_REQUIRED`
- `404 SELLER_NOT_FOUND`

### Rules

- action should be audit logged
- status change must not corrupt historical seller-linked records

---

## GET `/api/admin/products`

### Purpose

Lists products across the platform for moderation/management.

### Auth

- authenticated admin

### Query Params

- `status`
- `seller_id`
- `page`
- `page_size`

---

## PATCH `/api/admin/products/:id/status`

### Purpose

Changes admin-controlled product status such as suspend or reactivate.

### Auth

- authenticated admin

### Request Body

```json
{
  "status": "suspended",
  "reason": "Policy violation."
}
```

### Rules

- action should be audit logged
- should not invalidate historical order records

---

## GET `/api/admin/orders`

### Purpose

Lists platform orders for monitoring and support workflows.

### Auth

- authenticated admin

### Query Params

- `order_status`
- `payment_status`
- `seller_id`
- `customer_id`
- `page`
- `page_size`

---

## GET `/api/admin/orders/:id`

### Purpose

Returns detailed admin view of an order.

### Auth

- authenticated admin

### Notes

Should include enough information for support and operational review, without exposing unnecessary secrets.

---

## PATCH `/api/admin/orders/:id/status`

### Purpose

Allows controlled admin changes to order status.

### Auth

- authenticated admin

### Request Body

```json
{
  "order_status": "cancelled",
  "reason": "Customer support action."
}
```

### Rules

- sensitive
- should be tightly validated
- should be audit logged
- must not violate allowed state transitions without explicit override policy

---

## GET `/api/admin/coupons`

### Purpose

Lists coupons for management.

### Auth

- authenticated admin

---

## POST `/api/admin/coupons`

### Purpose

Creates a platform or seller-scoped coupon.

### Auth

- authenticated admin

### Request Body

```json
{
  "code": "SAVE10",
  "type": "percentage",
  "value_amount": "10.00",
  "minimum_order_amount": "50.00",
  "usage_limit_total": 100,
  "usage_limit_per_user": 1,
  "starts_at": "2026-01-01T00:00:00Z",
  "expires_at": "2026-01-31T23:59:59Z",
  "seller_id": null
}
```

### Possible Errors

- `400 VALIDATION_ERROR`
- `409 DUPLICATE_COUPON_CODE`

---

## PATCH `/api/admin/coupons/:id`

### Purpose

Updates coupon configuration.

### Auth

- authenticated admin

### Rules

- changing coupon state must not retroactively mutate already finalized order totals

---

## PATCH `/api/admin/coupons/:id/status`

### Purpose

Activates/deactivates coupon.

### Auth

- authenticated admin

---

## GET `/api/admin/categories`

### Purpose

Lists categories.

### Auth

- authenticated admin

---

## POST `/api/admin/categories`

### Purpose

Creates a category.

### Auth

- authenticated admin

---

## PATCH `/api/admin/categories/:id`

### Purpose

Updates a category.

### Auth

- authenticated admin

---

## DELETE `/api/admin/categories/:id`

### Purpose

Archives or disables a category rather than destructive deletion where products depend on it.

### Auth

- authenticated admin

### Rules

- deletion/archive policy must avoid breaking active product relations unexpectedly

---

# 9. Payment and Webhook Endpoints

## POST `/api/payments/confirm`

### Purpose

Optional endpoint to reconcile client-return flow after payment redirect.

### Auth

- authenticated user if customer flow requires it

### Rules

- must not be the sole source of final truth
- should verify against provider or internal payment state
- webhook/provider confirmation remains authoritative for finalization

---

## POST `/api/webhooks/stripe`

### Purpose

Receives Stripe webhook events and updates payment/order state.

### Auth

- provider signature verification required
- not session-authenticated in standard way

### Idempotency

- mandatory
- provider event ids must be tracked or safely deduplicated

### Behavior

- verify signature
- parse event
- resolve payment/session/order
- update payment record safely
- update order state if appropriate
- avoid duplicate side effects

### Response 200

```json
{
  "received": true
}
```

### Possible Errors

- `400 INVALID_SIGNATURE`
- `400 INVALID_PAYLOAD`
- `404 PAYMENT_REFERENCE_NOT_FOUND` optional depending on error policy

### Notes

Must be resilient to:

- duplicate delivery
- out-of-order delivery
- temporary DB failures
- retry from provider

---

# 10. Health / Internal Endpoints

## GET `/api/health`

### Purpose

Simple health endpoint for runtime verification.

### Auth

- internal/public depending on deployment preference

### Response 200

```json
{
  "status": "ok"
}
```

### Notes

Optional for app-level monitoring convenience.

---

# Validation Rules Summary

## General Validation

All mutation endpoints should validate:

- required fields
- type correctness
- enum bounds
- ownership
- role permissions
- business constraints

## Examples

- quantity > 0
- rating between allowed bounds
- coupon date windows valid
- slug uniqueness enforced
- status transitions explicitly validated

---

# Status Code Guidelines

## Success

- `200 OK` for standard reads/updates
- `201 Created` for resource creation
- `204 No Content` for successful delete/archive without body

## Client Errors

- `400 Bad Request` for validation/query/body issues
- `401 Unauthorized` for missing/invalid auth
- `403 Forbidden` for authenticated but not allowed
- `404 Not Found` for missing resource or intentionally concealed resource
- `409 Conflict` for business conflicts such as duplicate slug, invalid stock state, duplicate action risk
- `422 Unprocessable Entity` optional if preferred for semantic validation failures, but should be used consistently if chosen

## Server Errors

- `500 Internal Server Error`
- `502/503/504` where infrastructure or provider interactions fail appropriately

---

# Recommended Error Codes

## Auth / Access

- `UNAUTHORIZED`
- `FORBIDDEN`
- `ADMIN_ROLE_REQUIRED`
- `SELLER_ROLE_REQUIRED`

## Catalog

- `PRODUCT_NOT_FOUND`
- `PRODUCT_UNAVAILABLE`
- `INVALID_QUERY_PARAMS`
- `DUPLICATE_SLUG`

## Cart / Checkout

- `CART_EMPTY`
- `INVALID_COUPON`
- `COUPON_NOT_APPLICABLE`
- `CHECKOUT_CONFLICT`
- `ADDRESS_NOT_FOUND`

## Orders / Payments

- `ORDER_NOT_FOUND`
- `PAYMENT_NOT_FOUND`
- `INVALID_STATUS_TRANSITION`
- `PAYMENT_CONFIRMATION_FAILED`
- `INVALID_SIGNATURE`

## Reviews

- `REVIEW_NOT_ALLOWED`
- `DUPLICATE_REVIEW`

---

# Ownership Rules by Endpoint Family

## Customer

Customer endpoints may access:

- own profile
- own addresses
- own cart
- own orders
- own wishlist
- own review creation rights

## Seller

Seller endpoints may access:

- own seller profile
- own products
- own order-item views
- own summary metrics

## Admin

Admin endpoints may access:

- seller management
- product moderation
- order monitoring
- category and coupon administration
- platform metrics

---

# Transaction and Consistency Guidance

## Strongly Recommended Transaction-Safe Flows

- checkout/order creation
- stock decrement if stock is enforced synchronously
- payment reconciliation updates
- commission record creation

## Snapshot Requirements

At checkout/order creation time, snapshot at minimum:

- product title
- product slug if needed
- unit price
- currency
- seller id
- selected product metadata needed historically

---

# API Evolution Notes

## Versioning

Initial implementation may remain unversioned while internal scope is still evolving.

If the API surface becomes more public or externally consumed, consider:

- `/api/v1/...`

## Backward Compatibility

- avoid breaking the current `/list` route without migration plan
- prefer additive changes where possible
- document behavior changes in `DECISIONS.md` and `DEV_SUMMARY.md`

---

# Testing Priorities

## Highest Priority Endpoint Tests

- `GET /list`
- `GET /api/products`
- `GET /api/products/:slug`
- `POST /api/cart/items`
- `POST /api/checkout`
- `POST /api/webhooks/stripe`
- seller ownership checks
- admin role checks

## Must-Test Behaviors

- invalid role access
- duplicate checkout/idempotency behavior
- invalid coupon rejection
- unavailable item rejection
- payment webhook duplicate handling
- order visibility boundaries
- seller data isolation

---

# MVP Endpoint Priority

Implement in this order:

1. `GET /api/products`
2. `GET /api/products/:slug`
3. `GET /api/me`
4. cart endpoints
5. checkout endpoint
6. customer order endpoints
7. payment webhook endpoint
8. seller profile/dashboard/product endpoints
9. admin summary/seller/product/order endpoints
10. wishlist and review endpoints

---

# Source of Truth Order

When API behavior is unclear, resolve in this order:

1. `FEATURE_SPEC.md`
2. `DATABASE_SCHEMA.md`
3. `DECISIONS.md`
4. this file
5. implementation

If implementation intentionally diverges, update this file.

```

```
