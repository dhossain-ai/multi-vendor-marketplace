# Marketplace Platform

Production-minded full-stack multi-vendor marketplace platform built with Next.js 16, Supabase, Stripe test mode, and role-scoped seller/admin operations.

The repo now includes:

- Customer storefront/cart/checkout/payment foundation
- Seller registration and secure multi-vendor operations
- Admin seller/product/order management foundation
- A real ordered Supabase migration chain for fresh-project setup

### Currently Deferred (Not Implemented Yet)
- automated payouts (Stripe Connect)
- refund workflows
- product reviews and customer wishlists
- transactional notification system
- advanced seller analytics

The documentation in [`docs/`](docs) remains the source of truth for product rules and architecture.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase
- Stripe
- ESLint 9
- Prettier 3

## Project Structure

```text
src/
  app/                  App Router entrypoints, layouts, and route handlers
  components/           Shared layout and UI primitives
  features/
    admin/              Admin repositories, actions, and views
    auth/               Auth UI and account/session helpers
    cart/               Cart repository, actions, and cart UI
    catalog/            Public catalog repository and product detail UI
    checkout/           Checkout validation and pending-order creation
    orders/             Customer order history and detail views
    payments/           Stripe integration and payment status handling
    seller/             Seller dashboard repositories, actions, and views
    shared/             Shared data loaders such as active categories
  lib/
    auth/               Session, profile, role, and guard helpers
    config/             Environment and site configuration
    supabase/           Browser/server/admin Supabase client factories
    utils/              Generic utility helpers
  styles/               Shared design tokens
  types/                App-wide TypeScript types
supabase/
  migrations/           Ordered database bootstrap chain
docs/                   Product, architecture, and planning source of truth
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template and fill in your project values:

```powershell
Copy-Item .env.example .env.local
```

Required variables:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY` for payment testing
- `STRIPE_WEBHOOK_SECRET` for local Stripe webhook testing

3. Create a fresh Supabase project.

4. Apply the database schema in migration order.

Preferred path with Supabase CLI:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

SQL editor fallback:

Run the files in `supabase/migrations/` in filename order:

1. `202604200001_base_helpers_and_enums.sql`
2. `202604200002_auth_profile_foundation.sql`
3. `202604200003_catalog_foundation.sql`
4. `202604200004_cart_foundation.sql`
5. `202604200005_coupon_and_audit_foundation.sql`
6. `202604200006_checkout_orders_payments_foundation.sql`
7. `202604200007_marketplace_operations_reset.sql`

5. Promote the first admin explicitly after the target user has signed up:

```sql
update public.profiles
set role = 'admin'
where email = 'you@example.com';
```

6. Verify the schema is healthy:

```sql
select to_regclass('public.profiles');
select to_regclass('public.products');
select to_regclass('public.carts');
select to_regclass('public.orders');
```

Each query should return the matching relation name, not `null`.

7. Start the app:

```bash
npm run dev
```

8. Open `http://localhost:3000`.

## Role and Profile Notes

- `auth.users` is the Supabase identity source of truth.
- `public.profiles` is the application profile table.
- new `auth.users` rows automatically create matching `public.profiles` rows through a database trigger
- `profiles.role` controls `customer`, `seller`, and `admin`
- `seller_profiles.status` controls `pending`, `approved`, `rejected`, and `suspended`
- seller role and seller approval remain separate on purpose

Seller onboarding now happens through the app at `/sell`. Admin approval is still required before seller product and order operations unlock.

## Scripts

- `npm run dev` - start the local development server
- `npm run build` - create a production build
- `npm run start` - run the production server locally
- `npm run lint` - run ESLint
- `npm run typecheck` - run TypeScript type checking
- `npm run format` - format the repository with Prettier
- `npm run format:check` - verify formatting without writing changes

## Documentation Map

- [`docs/PROJECT_OVERVIEW.md`](docs/PROJECT_OVERVIEW.md)
- [`docs/AI_CONTEXT.md`](docs/AI_CONTEXT.md)
- [`docs/ROADMAP.md`](docs/ROADMAP.md)
- [`docs/FEATURE_SPEC.md`](docs/FEATURE_SPEC.md)
- [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md)
- [`docs/DECISIONS.md`](docs/DECISIONS.md)
- [`docs/STATUS.md`](docs/STATUS.md)
- [`docs/NEXT_STEPS.md`](docs/NEXT_STEPS.md)
- [`docs/architecture/ARCHITECTURE_OVERVIEW.md`](docs/architecture/ARCHITECTURE_OVERVIEW.md)
