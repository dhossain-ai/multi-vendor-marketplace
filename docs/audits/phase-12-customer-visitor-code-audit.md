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

Pending detailed findings.

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

Pending detailed findings.

## 11. Product detail audit

Pending detailed findings.

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
