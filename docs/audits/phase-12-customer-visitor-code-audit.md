# Phase 12 — Customer / Visitor Code Audit

## 1. Purpose

This audit compares the current customer and visitor implementation against `docs/blueprint/01-customer-flow.md`. It is audit-only and does not implement Phase 13 features.

## 2. Scope

Audited customer/visitor routes, customer-relevant feature modules, Supabase schema types, and migrations listed in the Phase 12 instructions. Seller/admin code was reviewed only where it affects customer visibility, coupons, order fulfillment, or role navigation.

## 3. Source documents reviewed

- `docs/blueprint/01-customer-flow.md`
- `docs/blueprint/phase-11-customer-workflow-start.md`
- `docs/STATUS.md`
- `docs/NEXT_STEPS.md`
- `docs/AI_CONTEXT.md`
- `docs/FEATURE_SPEC.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/API_SPEC.md`
- `docs/DECISIONS.md`
- `docs/architecture/auth-and-roles.md`
- `docs/architecture/catalog-and-search.md`
- `docs/architecture/checkout-and-payments.md`
- `docs/architecture/ARCHITECTURE_OVERVIEW.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-static-params.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/dynamic-routes.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`

## 4. Routes audited

- `/` via `src/app/page.tsx`
- `/products/[slug]` via `src/app/products/[slug]/page.tsx`
- `/sign-in` via `src/app/sign-in/page.tsx`
- `/sign-up` via `src/app/sign-up/page.tsx`
- `/auth/callback` via `src/app/auth/callback/route.ts`
- `/account` via `src/app/account/page.tsx`
- `/cart` via `src/app/cart/page.tsx`
- `/checkout` via `src/app/checkout/page.tsx`
- `/checkout/success` via `src/app/checkout/success/page.tsx`
- `/checkout/cancel` via `src/app/checkout/cancel/page.tsx`
- `/orders` via `src/app/orders/page.tsx`
- `/orders/[id]` via `src/app/orders/[id]/page.tsx`
- `/api/webhooks/stripe` via `src/app/api/webhooks/stripe/route.ts`
- Confirmed missing: `/products` listing route, `/account/profile`, `/account/addresses`, customer REST routes such as `/api/cart`, `/api/orders`, `/api/me/addresses`.

## 5. Feature modules audited

- Catalog: `src/features/catalog/components/*`, `src/features/catalog/lib/catalog-repository.ts`, `src/features/catalog/types.ts`
- Auth/account: `src/features/auth/components/*`, `src/lib/auth/*`
- Cart: `src/features/cart/components/*`, `src/features/cart/lib/*`, `src/features/cart/types.ts`
- Checkout/coupons: `src/features/checkout/components/*`, `src/features/checkout/lib/*`, `src/features/checkout/types.ts`
- Payments: `src/features/payments/lib/*`, `src/features/payments/types.ts`
- Orders: `src/features/orders/components/*`, `src/features/orders/lib/*`, `src/features/orders/types.ts`
- Shared layout/config: `src/components/layout/site-header.tsx`, `src/components/layout/site-footer.tsx`, `src/lib/config/*`
- Database alignment: `src/types/database.ts`, `supabase/migrations/*`

## 6. Visitor storefront audit

### Finding: Shopper-first homepage exists

- Classification: Partially implemented
- Current behavior: `src/app/page.tsx` loads `listPublicProducts()` and renders `StorefrontHome`. The homepage has a shopper-first hero, category highlights derived from loaded products, featured product cards, sign-up CTA, and links to cart/order/account through the header when signed in.
- Target behavior from blueprint: Homepage/storefront displays curated product sections, shopper-first public navigation, seller entry remains available, and visitors can browse visible products.
- Gap: Homepage is enough for MVP browsing, but it is still the only listing surface and shows a limited curated slice instead of a full paginated storefront.
- Recommended fix phase: Keep for MVP; Phase 15 catalog/storefront cleanup.
- Risk level: medium

### Finding: Product cards show customer-facing data

- Classification: Implemented
- Current behavior: `ProductCard` shows thumbnail/visual fallback, category, title, seller label, price, short description, availability-style text, and product detail link.
- Target behavior from blueprint: Product cards show thumbnail, title, price, seller/store name, and category.
- Gap: Product cards do not expose stock precision, but listing-level "Available now" is acceptable for MVP if detail/cart enforce availability.
- Recommended fix phase: Phase 15 if richer stock labels are desired on cards.
- Risk level: low

### Finding: Public product visibility is enforced in repository mapping and queries

- Classification: Implemented
- Current behavior: `listSupabaseProducts()` queries `products.status = active`; `mapProductRowToSummary()` additionally rejects non-approved sellers and inactive categories. Demo data uses the same mapper. Detail reads also pass through `mapProductRowToDetail()`, which relies on the same public visibility check.
- Target behavior from blueprint: Public listing and detail return only active products from approved sellers and active categories.
- Gap: The Supabase query only filters product status in SQL and filters seller/category after loading. This is still server-side but less index-efficient than pushing all visibility predicates into SQL or an RPC.
- Recommended fix phase: Phase 15 performance/reliability hardening.
- Risk level: low

### Finding: Public navigation is shopper-first with seller entry available

- Classification: Implemented
- Current behavior: `SiteHeader` leads with Shop/Categories/Featured. Signed-out visitors see Sign in/Sign up. Signed-in non-admins see Sell/Seller Application/Seller Dashboard based on seller state; admins see Admin Dashboard.
- Target behavior from blueprint: Public navigation is shopper-first and sell remains available as a seller landing or entry path.
- Gap: Signed-out header does not show a direct `/sell` link, even though `/sell` exists as public seller landing. Seller entry appears after sign-in.
- Recommended fix phase: Phase 15 navigation polish if public seller acquisition matters.
- Risk level: low

### Finding: Protected areas redirect visitors to sign-in

- Classification: Implemented
- Current behavior: Customer protected routes use `requireAuthenticatedUser()`. Visitors to `/cart`, `/checkout`, `/orders`, `/orders/[id]`, and `/account` are redirected to `/sign-in?next=...`.
- Target behavior from blueprint: Visitors cannot access protected account/cart/order areas without auth.
- Gap: None found for customer routes.
- Recommended fix phase: Keep as-is.
- Risk level: low

## 7. Authentication audit

### Finding: Supabase customer sign-up/sign-in/callback exists

- Classification: Implemented
- Current behavior: `/sign-up` and `/sign-in` call server actions in `src/lib/auth/actions.ts`; the callback exchanges code or OTP token, calls `ensureProfileForUser()`, and redirects to the sanitized `next` path.
- Target behavior from blueprint: Supabase Auth owns identity; profiles are app/database records; default account role is `customer`; callback handles provider redirects.
- Gap: The flow is present. Error messages expose the Supabase auth error text directly, which is acceptable for audit but should be reviewed for production copy consistency.
- Recommended fix phase: Phase 13 copy/security polish if needed; no blocking implementation change.
- Risk level: low

### Finding: Profile bootstrap is database-first with application reconciliation

- Classification: Implemented
- Current behavior: Migration `202604200002_auth_profile_foundation.sql` creates auth triggers that insert `profiles` with `role = 'customer'`. `ensureProfileForUser()` reconciles missing or stale email/full-name metadata.
- Target behavior from blueprint: Auth users get customer profiles automatically; reconciliation catches trigger failures.
- Gap: None for the customer default role rule. Admin is not automatic.
- Recommended fix phase: Keep as-is.
- Risk level: low

### Finding: Protected customer routes redirect signed-out users

- Classification: Implemented
- Current behavior: `/account`, `/cart`, `/checkout`, `/orders`, and `/orders/[id]` use `requireAuthenticatedUser(nextPath)`, which redirects to `/sign-in?next=...`.
- Target behavior from blueprint: Protected customer routes require auth and preserve the return path.
- Gap: The basic route protection exists. Sign-in redirects an already signed-in user to `/account` instead of honoring `next`, which is minor because the user is already authenticated.
- Recommended fix phase: Phase 13 or later auth UX polish.
- Risk level: low

### Finding: Sign-out is available from account page, not global header

- Classification: Partially implemented
- Current behavior: `AccountSummary` renders a sign-out form. `SiteHeader` shows cart/orders/account links for signed-in users but no sign-out control.
- Target behavior from blueprint: Sign out is available from header/account menu.
- Gap: Account-page sign-out exists; header-level sign-out does not.
- Recommended fix phase: Phase 13 account polish.
- Risk level: low

### Finding: Seller/admin roles remain app-level concerns

- Classification: Implemented
- Current behavior: `getAuthSessionState()` loads Supabase user, app profile, and seller profile separately. `requireRole()`, `requireSellerRole()`, and `requireAdminRole()` enforce role checks server-side.
- Target behavior from blueprint: Identity comes from Supabase Auth; roles and ownership are app/database concerns.
- Gap: None found in the customer-relevant route guards.
- Recommended fix phase: Keep as-is.
- Risk level: low

## 8. Account/profile audit

### Finding: `/account` exists and is customer-first

- Classification: Partially implemented
- Current behavior: `/account` requires auth, shows email, full name if available, role, active status, member date, order link, shopping link, seller entry, admin entry only for admins, and sign out.
- Target behavior from blueprint: `/account` is a customer home base with account summary, profile link, address book link, orders link, seller entry, and admin entry only for admins.
- Gap: The account hub is usable, but it has no `/account/profile` link and no `/account/addresses` link because those routes are missing.
- Recommended fix phase: Phase 13.
- Risk level: medium

### Finding: Customer profile editing is missing

- Classification: Missing
- Current behavior: No `src/app/account/profile` route exists. No customer profile update server action was found. `src/lib/auth/profile.ts` only loads/ensures profiles and refreshes auth metadata.
- Target behavior from blueprint: Customer can edit `profiles.full_name` through a server action that derives `user_id` from session and cannot mutate role/email.
- Gap: Full-name editing is not implemented.
- Recommended fix phase: Phase 13.
- Risk level: medium

### Finding: Role mutation is not exposed to customers

- Classification: Implemented
- Current behavior: No customer account form or action accepts `role`. Seller onboarding is separate, and admin promotion remains manual/explicit.
- Target behavior from blueprint: Customer cannot change their own role.
- Gap: None found in customer account code.
- Recommended fix phase: Keep as-is.
- Risk level: low

### Finding: Account/profile copy still contains operational/developer hints

- Classification: Risk / needs hardening
- Current behavior: Missing profile state says to "Check the Supabase configuration and profile tables before continuing." Homepage and account mention "Stripe test mode" and "role-specific dashboard."
- Target behavior from blueprint: Customer pages should use product language, not implementation language.
- Gap: A few customer-visible fallback and storefront strings are still developer/ops flavored.
- Recommended fix phase: Phase 13 copy polish for account/auth; Phase 15 broader storefront polish.
- Risk level: low

## 9. Address management audit

### Finding: Address app surface is missing

- Classification: Missing
- Current behavior: No `/account/addresses` route, address list/create/edit/delete UI, address repository, or address server actions were found.
- Target behavior from blueprint: Authenticated customers can list, create, edit, delete, and set one default saved address.
- Gap: Address management is entirely absent from the app layer.
- Recommended fix phase: Phase 13.
- Risk level: high

### Finding: Address database table is documented but not migrated or typed

- Classification: Missing
- Current behavior: `docs/DATABASE_SCHEMA.md` defines `addresses`, but `supabase/migrations/` contains no `addresses` table and `src/types/database.ts` contains no `addresses` table type.
- Target behavior from blueprint: Address table exists with ownership and default-address support.
- Gap: Schema docs and actual migration/types are not aligned.
- Recommended fix phase: Phase 13 migration/type planning, with migration creation only when implementation begins.
- Risk level: high

### Finding: Checkout cannot snapshot shipping address

- Classification: Missing
- Current behavior: `createPendingOrder()` writes `shipping_address_snapshot: null` and `billing_address_snapshot: null`.
- Target behavior from blueprint: Checkout selects a saved address and copies it into `orders.shipping_address_snapshot`; billing address is deferred or copied according to MVP policy.
- Gap: Orders are snapshot-backed for products but not for shipping address.
- Recommended fix phase: Phase 13 prepares address selection and snapshot data; Phase 14 wires checkout if the team wants checkout behavior changes separately.
- Risk level: high

### Finding: Default address rules are not represented

- Classification: Missing
- Current behavior: No address table, route, action, or checkout preselection exists.
- Target behavior from blueprint: Only one default address per user; checkout preselects it.
- Gap: No default-address model exists in code or migrations.
- Recommended fix phase: Phase 13.
- Risk level: medium

## 10. Product discovery audit

### Finding: `/products` listing route is missing

- Classification: Missing
- Current behavior: `src/app/products` contains only `[slug]`; there is no `/products/page.tsx`.
- Target behavior from blueprint: `/products` should show a paginated product grid for browsing and search/filter results.
- Gap: Full catalog browsing currently lives on the homepage only and is limited by `PUBLIC_PAGE_SIZE = 6` unless a caller passes a different limit.
- Recommended fix phase: Phase 15.
- Risk level: medium

### Finding: Search/filter/sort/pagination UI is missing

- Classification: Missing
- Current behavior: No customer search box, category-filtered listing route, price filters, sort controls, pagination controls, or autocomplete/typeahead were found in customer catalog routes/components.
- Target behavior from blueprint: Product listing supports keyword search, category, price range, sort, pagination, and autocomplete/typeahead.
- Gap: Discovery is curated and static rather than a complete catalog tool.
- Recommended fix phase: Phase 15.
- Risk level: medium

### Finding: Category sections exist but are not navigable filters

- Classification: Partially implemented
- Current behavior: `StorefrontHome` derives category highlights from the loaded products and renders category cards, but the cards are not links to category pages or filtered listings.
- Target behavior from blueprint: Category browsing should allow shoppers to filter by category.
- Gap: Category content is informational only.
- Recommended fix phase: Phase 15.
- Risk level: low

### Finding: Demo fallback is active in catalog repository

- Classification: Risk / needs hardening
- Current behavior: If Supabase public env is missing or a catalog query throws, `withSupabaseFallback()` returns `catalogDemoData` and logs a warning.
- Target behavior from blueprint: Public storefront should use server-filtered live products in production.
- Gap: Demo fallback is useful for local bootstrapping but risky if production env/schema misconfiguration silently shows demo products.
- Recommended fix phase: Phase 15; keep local fallback but make production behavior explicit.
- Risk level: medium

### Finding: Static slug generation touches cookie-backed Supabase server client

- Classification: Risk / needs hardening
- Current behavior: `/products/[slug]` exports `generateStaticParams()` which calls `listPublicProductSlugs()`. That path uses `listSupabaseProducts()`, which creates a Supabase server client via `createSupabaseServerClient()`, which calls `cookies()`.
- Target behavior from blueprint and installed Next docs: Build-time static generation should not depend on request-time cookie APIs; `generateStaticParams()` should use static-safe data access or return runtime-only params intentionally.
- Gap: Build currently warns and falls back to demo slugs/data in static generation.
- Recommended fix phase: Phase 15.
- Risk level: medium

## 11. Product detail audit

### Finding: Product detail route exists and returns hidden products as not found

- Classification: Implemented
- Current behavior: `/products/[slug]` loads `getPublicProductBySlug()`, calls `notFound()` if no public product is returned, and uses product metadata for page title/description.
- Target behavior from blueprint: Public detail route exists; draft/archived/suspended/seller-unapproved products return not-found/unavailable without leaking status.
- Gap: None found for public visibility. Hidden statuses are not displayed to shoppers.
- Recommended fix phase: Keep as-is.
- Risk level: low

### Finding: Product detail display is mostly complete

- Classification: Partially implemented
- Current behavior: `ProductDetailView` shows image(s), category, title, description, price, availability label, seller/store name, secure checkout copy, add-to-cart, and related products.
- Target behavior from blueprint: Product detail shows title, images, description, price, category, seller/store, availability, related products, and add-to-cart.
- Gap: Availability label is always `"Available now"` from catalog detail mapping. It does not derive "Low Stock" or "Out of Stock" from stock fields.
- Recommended fix phase: Phase 15 for detail display; Phase 14 if cart/checkout edge copy is bundled there.
- Risk level: medium

### Finding: Out-of-stock add-to-cart disable is missing at UI level

- Classification: Missing
- Current behavior: `AddToCartForm` always renders an enabled "Add to cart" button. The server action rejects unavailable/out-of-stock products through `addItemToCart()` and redirects with an error.
- Target behavior from blueprint: Out-of-stock products disable add-to-cart with an "Out of Stock" label.
- Gap: Server enforcement exists, but the product detail UI does not pre-disable based on stock.
- Recommended fix phase: Phase 14 or Phase 15, depending on whether it is handled as cart hardening or catalog detail cleanup.
- Risk level: medium

### Finding: Visitor add-to-cart redirects cleanly to sign-in

- Classification: Implemented
- Current behavior: `addToCartAction()` calls `requireAuthenticatedUser(nextPath)`. For visitors, the hidden `nextPath` is the current product detail path, so they are redirected to sign-in with return URL.
- Target behavior from blueprint: Button is visible to visitors but action requires auth and returns them to the product page.
- Gap: None found.
- Recommended fix phase: Keep as-is.
- Risk level: low

### Finding: Related product query is basic

- Classification: Partially implemented
- Current behavior: Related products are same-category filtered when a category slug exists and share the same public visibility mapper.
- Target behavior from blueprint: Related products should come from same category or similar products.
- Gap: Similarity is not implemented beyond same-category/newest.
- Recommended fix phase: Later refinement after core customer flow.
- Risk level: low

## 12. Cart audit

### Finding: Authenticated cart page and actions exist

- Classification: Implemented
- Current behavior: `/cart` requires auth, loads `getCartByUserId(session.user.id)`, and renders add/update/remove/clear/apply-coupon/remove-coupon flows through server actions.
- Target behavior from blueprint: Authenticated customers can view cart, add/update/remove/clear items, and preview coupons.
- Gap: No customer API route exists; implementation is server-action based. That is acceptable for the current App Router UI.
- Recommended fix phase: Keep as-is unless explicit API endpoints become required.
- Risk level: low

### Finding: Cart ownership is server-derived

- Classification: Implemented
- Current behavior: Cart actions derive `userId` from `requireAuthenticatedUser()`. Repository lookups first resolve the cart by `user_id`, then scope cart item updates/deletes by the owned `cart_id`.
- Target behavior from blueprint: `user_id` is never accepted from client input and ownership is server-enforced.
- Gap: None found in customer cart actions.
- Recommended fix phase: Keep as-is.
- Risk level: low

### Finding: Quantity and availability validation are server-side

- Classification: Implemented
- Current behavior: `assertValidQuantity()` enforces integer, greater than zero, and max 99. `assertPurchasableProduct()` checks active product, approved seller, active category, out-of-stock, and stock quantity limits.
- Target behavior from blueprint: Quantity is server-validated and product availability is checked.
- Gap: Stock is validated but not reserved/decremented, which is an accepted MVP limitation until stock reservation is designed.
- Recommended fix phase: Phase 14 for cart/checkout hardening; later for stock reservation.
- Risk level: medium

### Finding: Unavailable items are flagged and checkout is blocked

- Classification: Implemented
- Current behavior: `getCartByUserId()` maps each item with availability state and `hasUnavailableItems`; `CartSummary` blocks checkout and shows warning text when any item is unavailable or limited.
- Target behavior from blueprint: Unavailable items show warning and prevent checkout.
- Gap: Warning is item-level and summary-level, but the item copy could be more specific for category/seller/product causes.
- Recommended fix phase: Phase 14 copy/edge refinement.
- Risk level: low

### Finding: Cart totals are provisional and server-calculated

- Classification: Implemented
- Current behavior: Cart subtotal/discount/estimated total are computed in `cart-repository.ts`; copy says final totals are confirmed during checkout.
- Target behavior from blueprint: Cart does not trust client totals and labels totals as provisional/estimated.
- Gap: None found.
- Recommended fix phase: Keep as-is.
- Risk level: low

## 13. Coupon audit

### Finding: Coupon apply/remove exists in cart

- Classification: Implemented
- Current behavior: Cart summary includes coupon code input, applied-coupon display, remove action, and server actions that update `carts.coupon_id`.
- Target behavior from blueprint: Customer can apply and remove coupons; preview is advisory.
- Gap: Coupon UI lives in cart, not checkout. Blueprint allows cart or checkout entry.
- Recommended fix phase: Keep as-is for MVP.
- Risk level: low

### Finding: Coupon validation is server-side and revalidated at checkout

- Classification: Implemented
- Current behavior: `evaluateCoupon()` checks existence, active flag, start/end dates, seller scope, minimum order amount, total usage limit, and per-user usage limit. `validateCheckout()` re-evaluates the saved `coupon_id` against current cart items before order creation.
- Target behavior from blueprint: Server validates coupons during preview and checkout.
- Gap: Usage counts are calculated from existing orders and are not transactionally reserved, so concurrent checkout can race usage limits.
- Recommended fix phase: Phase 14 hardening if usage limits are considered production-critical.
- Risk level: medium

### Finding: Coupon discounts persist into orders and order items

- Classification: Implemented
- Current behavior: `createPendingOrder()` writes `orders.coupon_id`, `orders.discount_amount`, and `order_items.discount_amount` after distributing the discount across eligible lines.
- Target behavior from blueprint: `orders.coupon_id` and per-line `order_items.discount_amount` are persisted at order creation.
- Gap: No separate coupon redemption ledger exists, so usage enforcement depends on orders with non-failed/non-cancelled statuses.
- Recommended fix phase: Later hardening unless coupon concurrency becomes a Phase 14 priority.
- Risk level: medium

### Finding: Seller-scoped coupon support exists

- Classification: Partially implemented
- Current behavior: Admin coupon repository supports `seller_id`; `evaluateCoupon()` applies only to matching seller line subtotals and messages that the coupon applies to one seller.
- Target behavior from blueprint: Seller-scoped coupons exist or are intentionally deferred.
- Gap: Customer UI does not explain which lines were eligible beyond aggregate messaging, and usage/concurrency is still order-count based.
- Recommended fix phase: Phase 14 or later coupon UX/hardening.
- Risk level: low

### Finding: Coupon RLS depends on service-role server access

- Classification: Risk / needs hardening
- Current behavior: `coupons` RLS is admin-only for authenticated users. Customer coupon evaluation works through `createSupabaseAdminClient()` when `SUPABASE_SERVICE_ROLE_KEY` exists; otherwise it falls back to a server client that may not be allowed to read coupons.
- Target behavior from blueprint: Customer coupon validation should work reliably server-side.
- Gap: Environments without service-role configuration may fail coupon validation.
- Recommended fix phase: Phase 14 environment/runtime hardening.
- Risk level: medium

## 14. Checkout audit

### Finding: Checkout requires auth and revalidates cart server-side

- Classification: Implemented
- Current behavior: `/checkout` requires auth, calls `validateCheckout(userId)`, reloads cart/items/products/coupon from DB, and blocks invalid items before payment.
- Target behavior from blueprint: Checkout requires auth and revalidates cart, availability, prices, and coupons from server state.
- Gap: None found for server-authoritative validation.
- Recommended fix phase: Keep as-is.
- Risk level: low

### Finding: Pending order creation is snapshot-backed for products and totals

- Classification: Partially implemented
- Current behavior: `createPendingOrder()` creates an `orders` row and `order_items` rows with title, slug, price, seller id, category/seller metadata, discount, tax, and total amounts.
- Target behavior from blueprint: Checkout creates pending orders with immutable item snapshots.
- Gap: The order and item inserts plus cart clearing are coordinated with application-side rollback, not a single DB transaction/RPC.
- Recommended fix phase: Phase 14 hardening.
- Risk level: high

### Finding: Checkout clears cart after pending-order creation

- Classification: Implemented
- Current behavior: After order item insert succeeds, `clearCartAfterOrder()` deletes `cart_items` and clears saved `coupon_id`.
- Target behavior from blueprint and D-015: Cart is cleared after pending-order creation before/around payment redirect as an MVP simplification.
- Gap: If Stripe session creation fails after cart clearing, the pending order remains and the user retries from order detail rather than cart.
- Recommended fix phase: Keep as accepted MVP tradeoff; Phase 14 could improve copy/retry.
- Risk level: medium

### Finding: Address selection and shipping snapshot are missing

- Classification: Missing
- Current behavior: Checkout UI has no address section or `address_id` input; `createPendingOrder()` stores both address snapshot columns as null.
- Target behavior from blueprint: Checkout should select a saved address and snapshot it to the order once address management is implemented.
- Gap: Physical-shipping readiness is incomplete.
- Recommended fix phase: Phase 13 to build address book and prepare checkout address selection; Phase 14 to finish checkout wiring if split.
- Risk level: high

### Finding: Checkout idempotency is partial

- Classification: Risk / needs hardening
- Current behavior: Order numbers are unique and payment session creation reuses an existing processing payment for an order, but checkout initiation itself does not accept/persist an idempotency key or reuse an existing pending order for duplicate submits.
- Target behavior from blueprint: Checkout should be idempotent where practical and resist duplicate submissions.
- Gap: A double submit could create duplicate pending orders before payment session reuse applies, especially because pending order creation precedes Stripe session creation.
- Recommended fix phase: Phase 14.
- Risk level: high

## 15. Stripe payment flow audit

### Finding: Stripe Checkout session creation exists

- Classification: Implemented
- Current behavior: `createPaymentSessionForOrder()` validates order ownership/status/total, creates Stripe Checkout line items from order item snapshots, stores a `payments` row in `processing`, and redirects to the Stripe session URL.
- Target behavior from blueprint: Checkout creates a Stripe Checkout session tied to a pending order/payment attempt.
- Gap: The Stripe line items use unit price and quantity, while the payment record amount uses discounted order total. This can diverge for discounted orders because line items do not include discounts.
- Recommended fix phase: Phase 14 payment handoff hardening.
- Risk level: high

### Finding: Payment session retry is order-owner scoped

- Classification: Implemented
- Current behavior: `startPaymentAction(orderId)` derives the user from session, and `createPaymentSessionForOrder()` checks `order.customer_id === userId`.
- Target behavior from blueprint: Customer can only pay for own orders and cannot spoof payment ownership.
- Gap: None found for ownership.
- Recommended fix phase: Keep as-is.
- Risk level: low

### Finding: Webhook verifies Stripe signature and updates payment/order statuses

- Classification: Implemented
- Current behavior: `/api/webhooks/stripe` reads raw request text, requires `stripe-signature`, calls `stripe.webhooks.constructEvent()`, and handles `checkout.session.completed` and `checkout.session.expired`.
- Target behavior from blueprint: Webhook is provider-authoritative and updates payment/order state.
- Gap: No storage of Stripe event ids exists, so idempotency relies on payment status checks and unique session/payment identifiers rather than event-level dedupe.
- Recommended fix phase: Phase 14 or later payment hardening.
- Risk level: medium

### Finding: Webhook status transitions match D-015

- Classification: Implemented
- Current behavior: Completed session sets `payments.status = paid`, `orders.payment_status = paid`, and `orders.order_status = confirmed`; expired session sets payment/order payment status to failed and leaves order status pending.
- Target behavior from blueprint: Server/provider confirmation transitions payment and order statuses.
- Gap: Failed non-expired payment events beyond `checkout.session.expired` are not handled.
- Recommended fix phase: Later payment hardening.
- Risk level: medium

### Finding: Success/cancel pages use confirmation-safe language

- Classification: Implemented
- Current behavior: Success page says "Your payment is being confirmed" and points customers to orders. Cancel page says payment was not completed and links to order retry, orders, cart, and shop.
- Target behavior from blueprint: Success page avoids claiming durable completion before webhook confirmation; cancel page allows retry/next step.
- Gap: Success page does not deep-link to the specific order because only `session_id` is present in the return URL.
- Recommended fix phase: Phase 14 or later UX polish.
- Risk level: low

## 16. Order history audit

### Finding: Customer order history route exists and is owner-scoped

- Classification: Implemented
- Current behavior: `/orders` requires auth and calls `getCustomerOrders(session.user.id)`, which filters `orders.customer_id = userId`.
- Target behavior from blueprint: Customer sees only their own orders.
- Gap: None found in customer order list query.
- Recommended fix phase: Keep as-is.
- Risk level: low

### Finding: Order list shows core customer fields

- Classification: Implemented
- Current behavior: `OrdersListView` shows order number, item count, operational status, payment status, date, total, and links to order detail.
- Target behavior from blueprint: Order history shows order number/date/status/payment/total/action.
- Gap: Pagination is missing.
- Recommended fix phase: Later phase unless order volume grows; Phase 14 if order cleanup includes pagination.
- Risk level: low

### Finding: Customer-facing order labels are mostly friendly but not blueprint-exact

- Classification: Partially implemented
- Current behavior: `order-status-copy.ts` maps payment statuses to labels, and `order-progress.ts` derives operational stages. `unfulfilled` currently labels as "Confirmed" rather than blueprint "Preparing Your Order". `pending` order status maps to "Pending review", although the list mostly uses operational-stage labels.
- Target behavior from blueprint: Customer-facing labels include "Order Received", "Payment Pending", and "Preparing Your Order"; raw enum values should not be shown.
- Gap: Raw enum values are avoided, but some labels drift from the blueprint language.
- Recommended fix phase: Phase 14 order/customer copy cleanup.
- Risk level: low

## 17. Order detail and fulfillment visibility audit

### Finding: Customer order detail route exists and is owner-scoped

- Classification: Implemented
- Current behavior: `/orders/[id]` requires auth and calls `getCustomerOrderById(session.user.id, id)`, filtering by both `customer_id` and `id`; missing/non-owned orders render `notFound()`.
- Target behavior from blueprint: Customer can only view own order detail.
- Gap: None found.
- Recommended fix phase: Keep as-is.
- Risk level: low

### Finding: Detail displays item snapshots, totals, discounts, tracking, and shipment notes

- Classification: Implemented
- Current behavior: Order detail maps `order_items` snapshot fields and renders product title snapshot, quantity, unit price, line total, discount/tax/order totals, fulfillment status, tracking code, shipment note, shipped/delivered timestamps, and seller/category names from `product_metadata_snapshot`.
- Target behavior from blueprint: Detail shows item snapshots, seller/store per item, totals/discounts, fulfillment status, tracking code, and shipment note.
- Gap: Seller/store display depends on metadata snapshot, not an explicit joined seller snapshot column. This is acceptable but should remain stable.
- Recommended fix phase: Keep current snapshot approach; consider typed metadata improvements later.
- Risk level: low

### Finding: Shipping address snapshot is not shown because it is not loaded/populated

- Classification: Missing
- Current behavior: `getCustomerOrderById()` does not select `shipping_address_snapshot`, and checkout stores it as null.
- Target behavior from blueprint: Order detail shows shipping address snapshot if available.
- Gap: Address display is blocked by missing address management and checkout snapshot population.
- Recommended fix phase: Phase 13/14.
- Risk level: high

### Finding: Multi-vendor item grouping is missing

- Classification: Partially implemented
- Current behavior: Items show seller name per line but render as one flat list.
- Target behavior from blueprint: Multi-vendor order detail groups items by seller for clarity.
- Gap: Per-line seller visibility exists, but grouping by seller is not implemented.
- Recommended fix phase: Phase 14 order detail cleanup.
- Risk level: medium

### Finding: Customer cannot mutate order/payment state

- Classification: Implemented
- Current behavior: Customer order detail exposes only payment retry for own pending/unpaid or failed orders. Fulfillment/order/payment state updates are handled by seller/admin/webhook paths, not customer forms.
- Target behavior from blueprint: Customer can view but not mutate order/payment state.
- Gap: None found.
- Recommended fix phase: Keep as-is.
- Risk level: low

## 18. Customer security and ownership audit

### Finding: Customer identity is consistently derived from session in audited flows

- Classification: Implemented
- Current behavior: Cart, checkout, account, orders, and payment retry call `requireAuthenticatedUser()` and use `session.user.id` as `userId`/`customer_id`.
- Target behavior from blueprint: Customer identity comes from server-side Supabase session, never client-submitted `user_id`.
- Gap: None found in customer server actions/pages.
- Recommended fix phase: Keep as-is.
- Risk level: low

### Finding: Cart/order ownership is enforced in both app queries and RLS

- Classification: Implemented
- Current behavior: App repositories scope carts by `carts.user_id`, cart items by owned cart, and orders by `orders.customer_id`. Migrations add RLS policies/functions for owned carts, cart items, orders, order items, and payments.
- Target behavior from blueprint: Cart and order ownership must be server-enforced.
- Gap: App code often uses service-role clients when configured, so RLS is a backstop rather than the primary app guard. The app-level filters are present in the customer paths reviewed.
- Recommended fix phase: Keep, and test ownership regressions in Phase 14.
- Risk level: low

### Finding: Checkout does not trust client totals

- Classification: Implemented
- Current behavior: Checkout action accepts no total/price/coupon values from the client; it reloads current cart/product/coupon data and computes totals server-side.
- Target behavior from blueprint: Checkout totals are server-authoritative.
- Gap: None found.
- Recommended fix phase: Keep as-is.
- Risk level: low

### Finding: Payment success is webhook/provider authoritative

- Classification: Implemented
- Current behavior: Success page does not update order status. Webhook handles status changes after verifying the Stripe signature.
- Target behavior from blueprint: Customer cannot claim payment success through redirect alone.
- Gap: Event-id persistence is missing, but redirect is not authoritative.
- Recommended fix phase: Phase 14/later payment hardening.
- Risk level: medium

### Finding: Address ownership does not exist because addresses do not exist

- Classification: Missing
- Current behavior: No address table, route, action, or RLS policy exists.
- Target behavior from blueprint: Customers can only manage own addresses.
- Gap: Address ownership cannot be enforced until address management is implemented.
- Recommended fix phase: Phase 13.
- Risk level: high

### Finding: Customer access to seller/admin pages is server-guarded

- Classification: Implemented
- Current behavior: Seller/admin layouts and pages use role/status guard utilities. Header visibility is UX only and backed by server checks.
- Target behavior from blueprint: Customer cannot access seller/admin pages without role/status.
- Gap: No customer-side role bypass found in audited route guards.
- Recommended fix phase: Keep as-is.
- Risk level: low

## 19. Database/schema alignment audit

### Finding: Profile and role schema is aligned

- Classification: Implemented
- Current behavior: Migrations and `src/types/database.ts` include `profiles.full_name`, `profiles.role`, `profiles.is_active`, timestamps, and auth trigger bootstrap.
- Target behavior from blueprint: Profiles support email/full name/role, with role defaulting to customer.
- Gap: No customer profile update action yet.
- Recommended fix phase: Phase 13.
- Risk level: low

### Finding: Address schema docs contradict migrations/types

- Classification: Missing
- Current behavior: `docs/DATABASE_SCHEMA.md` defines an `addresses` table, but migrations and `src/types/database.ts` do not include it.
- Target behavior from blueprint: Address table exists and is app-owned by customer.
- Gap: Documentation is ahead of actual schema.
- Recommended fix phase: Phase 13.
- Risk level: high

### Finding: Order snapshot and coupon columns exist

- Classification: Implemented
- Current behavior: Migrations and types include `orders.shipping_address_snapshot`, `orders.billing_address_snapshot`, `orders.coupon_id`, `orders.discount_amount`, `order_items.discount_amount`, `order_items.fulfillment_status`, `tracking_code`, and `shipment_note`.
- Target behavior from blueprint: Orders and order items support address snapshots, coupons, discounts, and fulfillment/tracking visibility.
- Gap: Address snapshot columns exist but are not populated or displayed in customer detail.
- Recommended fix phase: Phase 13/14.
- Risk level: high

### Finding: `src/types/database.ts` is hand-written/subset-like despite schema alignment

- Classification: Risk / needs hardening
- Current behavior: `docs/STATUS.md` says database typing is a hand-written subset. The file looks generated-shaped but includes only current tables and lacks `addresses`.
- Target behavior from blueprint/status docs: Generated Supabase types should be produced from the finalized live schema after migrations are applied.
- Gap: Risk of type drift remains. If docs say generated types are pending while the file appears generated, contributors may overtrust it.
- Recommended fix phase: Dedicated generated-types phase or the first implementation phase that applies address migrations.
- Risk level: medium

## 20. UX/content language audit

### Finding: Core customer wording is mostly product-facing

- Classification: Partially implemented
- Current behavior: Cart, checkout, orders, and account pages generally use customer language such as "Your cart", "Proceed to payment", "Order history", "Payment pending", and "Continue shopping".
- Target behavior from blueprint: Customer-visible text should avoid raw enum/developer language and use clear product language.
- Gap: Several places still mention implementation details: "Stripe test mode" on homepage/detail, "Supabase configuration and profile tables" on account fallback, "role-specific dashboard" on sign-in, and "pending review" for order status copy.
- Recommended fix phase: Phase 13 for auth/account copy; Phase 14 for order/checkout copy; Phase 15 for storefront copy.
- Risk level: low

### Finding: Status language avoids raw enum values but drifts from blueprint labels

- Classification: Partially implemented
- Current behavior: Payment and operational labels are mapped, not raw enum values. Fulfillment `unfulfilled` displays as "Confirmed".
- Target behavior from blueprint: `unfulfilled` should read "Preparing Your Order"; `pending` should read "Order Received"; payment status should read "Payment Pending/Processing/Confirmed".
- Gap: Some labels are friendly but not consistent with blueprint.
- Recommended fix phase: Phase 14.
- Risk level: low

## 21. Build/runtime warning audit

### Finding: Catalog static generation warning cause is verified

- Classification: Risk / needs hardening
- Current behavior: `src/app/products/[slug]/page.tsx` calls `listPublicProductSlugs()` inside `generateStaticParams()`. The repository creates a Supabase server client through `createSupabaseServerClient()`, which calls `cookies()` from `next/headers`. The same repository path is used by `/`. Installed Next docs for `generateStaticParams`, dynamic routes, and route handlers confirm static/build paths should not depend on request runtime APIs such as cookies.
- Target behavior from blueprint: Catalog build/runtime behavior should be reliable and avoid demo-data fallback warnings.
- Gap: Build-time slug generation and catalog rendering touch cookies and fall back to demo data on failure.
- Recommended fix phase: Phase 15.
- Risk level: medium

### Finding: Quality check results

- Classification: Implemented
- Current behavior: `npm run lint` passed. `npm run typecheck` passed after `next typegen`. `npm run build` passed on Next.js 16.2.4/Turbopack and generated all routes successfully.
- Target behavior from blueprint: Document current lint/typecheck/build status and any static-generation warnings.
- Gap: Build still logs catalog fallback warnings:
  - `/products/[slug]` used `cookies()` inside `generateStaticParams`, which is unsupported because it runs at build time without an HTTP request.
  - `/products/[slug]` and `/` could not be rendered statically because catalog reads used `cookies`.
  - The catalog repository used demo data after those failures.
- Recommended fix phase: Phase 12 verification only.
- Risk level: medium

## 22. Keep / remove / rebuild recommendations

### Keep

- Supabase Auth + profile trigger bootstrap with `ensureProfileForUser()` reconciliation.
- Server-side route guards for account, cart, checkout, orders, seller, and admin areas.
- Public catalog visibility mapper that rejects inactive products, unapproved sellers, and inactive categories.
- Server-derived cart ownership and cart item mutation scoping.
- Server-authoritative checkout validation and order item snapshot creation.
- Coupon validation and checkout revalidation model.
- Stripe webhook as the only durable payment confirmation path.
- Customer order list/detail ownership filters and fulfillment/tracking visibility.

### Remove

- Do not remove functional customer code in Phase 13.
- Consider removing or production-gating silent catalog demo fallback for deployed environments in Phase 15.
- Consider removing customer-visible implementation wording such as "Supabase configuration", "profile tables", and "Stripe test mode" from storefront/account copy.

### Rebuild / harden

- Build `/account/profile` with session-derived full-name update only.
- Build `/account/addresses` with address CRUD, single-default enforcement, ownership checks, and RLS.
- Prepare checkout address selection and populate `orders.shipping_address_snapshot`.
- Harden checkout idempotency and transactional order creation.
- Fix discounted Stripe session line items so provider amount matches `orders.total_amount`.
- Build a real `/products` listing with search/filter/sort/pagination.
- Replace static slug generation's cookie-backed Supabase path with a static-safe catalog read strategy.
- Regenerate Supabase database types from an applied schema once address schema lands.

## 23. Highest-risk gaps

1. Missing address management route/app/schema/type layer blocks shipping address snapshots.
2. Checkout writes `shipping_address_snapshot` and `billing_address_snapshot` as null, so customer orders lack shipping history.
3. Stripe Checkout line items are built from undiscounted unit prices while the internal payment/order amount may include discounts.
4. Checkout initiation is not idempotent enough and order creation uses application-side rollback instead of a transaction/RPC.
5. Catalog static generation touches `cookies()` through the Supabase server client and falls back to demo data.
6. `/products` listing plus search/filter/sort/pagination/autocomplete are missing.
7. Database docs define `addresses`, but migrations and `src/types/database.ts` do not.
8. Coupon usage-limit enforcement is non-transactional and can race under concurrent checkouts.
9. Product detail availability display is static and does not disable out-of-stock add-to-cart at render time.
10. Customer status/copy labels are friendly but not fully aligned with blueprint language.

## 24. Recommended Phase 13 scope

Recommendation: keep the next implementation slice as **Phase 13 — Customer Account and Address Management**.

Smallest valuable Phase 13 scope:

- Add `/account/profile`.
- Add a server action/repository to update only `profiles.full_name` for the current session user.
- Add `/account/addresses`.
- Add address schema migration, RLS, and generated/types update plan.
- Add address list/create/edit/delete/set-default server actions derived from session user.
- Enforce one default shipping address per user.
- Add account links to profile and address book.
- Prepare checkout-facing address selection data shape, but do not complete broad checkout refactors unless explicitly included in Phase 13.
- Prepare `shipping_address_snapshot` mapping for Phase 14 checkout integration.

Reason: Address management is the highest-priority missing customer feature because checkout cannot populate immutable shipping snapshots without it. Profile editing is smaller and naturally fits the same account slice.

## 25. Later phase recommendations

- Phase 14 — Cart, Checkout, and Customer Order Cleanup:
  - fix Stripe discounted line-item/amount mismatch
  - add checkout idempotency or pending-order reuse
  - move order creation/cart clearing into a transaction/RPC
  - wire selected address into checkout and `shipping_address_snapshot`
  - align customer order/payment/fulfillment labels with blueprint
  - group order detail items by seller
  - harden coupon usage-limit concurrency
- Phase 15 — Catalog/Search/Storefront Reliability Cleanup:
  - add `/products`
  - implement search/filter/sort/pagination/category browsing
  - add typeahead/autocomplete if still MVP-required
  - make static slug generation static-safe or intentionally runtime-only
  - production-gate demo catalog fallback
  - improve stock labels on product cards/detail
- Later:
  - generated Supabase types from the applied live schema
  - wishlist/reviews only after account/cart/checkout/order basics are stable
  - refunds, payouts, notifications, and seller campaigns after core buying flow is hardened
