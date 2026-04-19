# Marketplace Platform

Production-minded full-stack multi-vendor marketplace foundation.

This repository currently includes a public catalog foundation with listing and product detail pages. The documentation in [`docs/`](docs) remains the source of truth for product direction and architecture.

## Current Scope

Completed so far:

- Next.js App Router with TypeScript
- Tailwind CSS v4 baseline
- ESLint and Prettier configuration
- scalable `src/` folder structure
- public catalog landing page
- slug-based product detail pages
- catalog repository/data-access layer
- Supabase client scaffolding
- environment example file
- updated project docs for current state

Not implemented yet:

- authentication and role enforcement
- cart and checkout
- payment integration
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
    catalog/            Catalog types, repository logic, and public catalog UI
  lib/
    auth/               Role and access-related primitives
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
- placeholder database typings to replace with generated schema types later

This is intentionally limited to public catalog reads right now. Auth, cart, checkout, payments, and dashboard behavior are still deferred.

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
