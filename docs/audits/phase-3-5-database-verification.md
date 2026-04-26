# Phase 3.5 — Database Verification and Typegen Unblock

## 1. Purpose

Verify the seller database foundation before Phase 4 seller registration work begins.

Phase 3 added `supabase/migrations/202604260008_seller_recovery_foundation.sql` for seller profile recovery fields, `seller_status_history`, `products.low_stock_threshold`, and the `public.is_admin()` compatibility wrapper.

## 2. Verification scope

- Supabase tooling availability.
- Full migration-chain verification path.
- Migration-order risk around `public.is_admin()`.
- Phase 3 seller recovery migration objects.
- Supabase type generation readiness.
- Application lint, typecheck, and build after database/type work.

## 3. Tooling state

| Check | Result | Notes |
|---|---|---|
| Docker Desktop | Blocked | Docker API pipe `dockerDesktopLinuxEngine` is unavailable. |
| Local Supabase reset | Blocked | `npx supabase db reset` cannot inspect the local Supabase DB container without Docker. |
| Supabase CLI link | Blocked | `npx supabase migration list` reports no linked project ref. |
| Remote project ref | Present in app env only | `.env.local` contains a Supabase URL, but the repo has no CLI link or evidence that the project is disposable/dev. |
| Remote migration push | Not attempted | Avoided because the available remote project cannot be confirmed as non-production. |

## 4. Migration helper ordering check

The pre-Phase 3.5 chain had a real ordering issue:

- `202604200007_marketplace_operations_reset.sql` references `public.is_admin()`.
- `public.is_admin()` was only created later in `202604260008_seller_recovery_foundation.sql`.
- A clean reset would therefore risk failing before the Phase 3 compatibility wrapper could run.

Phase 3.5 fixed this by adding `public.is_admin()` immediately after `public.is_admin_user()` in `202604200002_auth_profile_foundation.sql`. The wrapper delegates to the canonical helper and does not weaken admin checks.

