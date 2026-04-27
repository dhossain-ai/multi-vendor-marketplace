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

Pending detailed findings.

## 13. Coupon audit

Pending detailed findings.

## 14. Checkout audit

Pending detailed findings.

## 15. Stripe payment flow audit

Pending detailed findings.

## 16. Order history audit

Pending detailed findings.

## 17. Order detail and fulfillment visibility audit

Pending detailed findings.

## 18. Customer security and ownership audit

Pending detailed findings.

## 19. Database/schema alignment audit

Pending detailed findings.

## 20. UX/content language audit

Pending detailed findings.

## 21. Build/runtime warning audit

Pending detailed findings.

## 22. Keep / remove / rebuild recommendations

### Keep

Pending detailed findings.

### Remove

Pending detailed findings.

### Rebuild / harden

Pending detailed findings.

## 23. Highest-risk gaps

Pending detailed findings.

## 24. Recommended Phase 13 scope

Pending detailed findings.

## 25. Later phase recommendations

Pending detailed findings.
