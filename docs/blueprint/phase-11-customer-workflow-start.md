# Phase 11 — Customer / Visitor Workflow Start

## Why customer workflow is next
With the seller flow completed through Phase 9 (registration, product rules, order privacy, and fulfillment hardening), the marketplace has a secure supply side. The next logical step is to recover and harden the demand side: the customer and visitor workflow.

## What currently exists
- A basic storefront and `/products/[slug]` routing.
- Authenticated cart foundation (`/cart`).
- Checkout routing and Stripe test-mode pending order creation.
- Customer order history with fulfillment status badges.
- Supabase auth integration.

## What needs blueprint/audit
We must plan and review the following areas to ensure a robust, client-ready customer experience:
- Visitor storefront browsing, filtering, and sorting.
- Product listing and detailed view refinement.
- Sign up / sign in flows and error handling.
- Customer account dashboard, profile editing, and address management.
- Cart stability and edge cases (e.g., out of stock items).
- Coupon application UX.
- Checkout flow stability and Stripe payment confirmation.
- Order history, order detail, and tracking code visibility.

## What not to build yet
- Do not build admin refund tooling.
- Do not implement automated payouts or Stripe Connect.
- Do not implement transactional notification emails.
- Do not add complex review or wishlist systems until the core purchasing flow is fully recovered.
