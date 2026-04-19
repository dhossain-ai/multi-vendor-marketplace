# Marketplace Platform

Production-minded full-stack multi-vendor marketplace foundation.

This repository currently includes a public catalog foundation plus authentication, role, and cart scaffolding. The documentation in [`docs/`](docs) remains the source of truth for product direction and architecture.

## Current Scope

Completed so far:

- Next.js App Router with TypeScript
- Tailwind CSS v4 baseline
- ESLint and Prettier configuration
- scalable `src/` folder structure
- public catalog landing page
- slug-based product detail pages
- catalog repository/data-access layer
- sign up, sign in, sign out, and callback handling
- server-side session, profile, and seller-profile loading
- role-aware route protection foundations
- authenticated cart reads/writes with server-side ownership checks
- protected `/cart` page and add-to-cart from product detail
- minimal authenticated account page and protected seller/admin placeholders
- Supabase client scaffolding
- environment example file
- updated project docs for current state

Not implemented yet:

- cart and checkout
- payment integration
- seller onboarding flow
- seller or admin dashboards

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- ESLint 9
- Prettier 3
- Supabase client scaffolding

## Project Structure

```text
src/
  app/                  App Router entrypoints, layout, and global styles
  components/           Reusable layout and UI primitives
  features/
    auth/               Auth UI building blocks for account and protected placeholders
    catalog/            Catalog types, repository logic, and public catalog UI
  lib/
    auth/               Session, profile, action, and guard primitives
    config/             Site and environment configuration
    supabase/           Browser/server/admin Supabase client factories
    utils/              Generic utility helpers
  styles/               Shared design tokens
  types/                App-wide TypeScript types
docs/                   Product, architecture, and planning source of truth
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template and fill in your Supabase values:

```powershell
Copy-Item .env.example .env.local
```

Required variables:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

3. Start the app:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Scripts

- `npm run dev` - start the local development server
- `npm run build` - create a production build
- `npm run start` - run the production server locally
- `npm run lint` - run ESLint
- `npm run typecheck` - run TypeScript type checking
- `npm run format` - format the repository with Prettier
- `npm run format:check` - verify formatting without writing changes

## Supabase Scaffolding

The repo currently includes scaffold files for:

- browser client creation
- server client creation with Next cookies
- admin client creation for server-only privileged work
- hand-written schema typings to replace with generated Supabase types later

This now covers catalog reads plus auth/session/cart foundations. Checkout, payments, and real seller/admin product features are still deferred.

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
