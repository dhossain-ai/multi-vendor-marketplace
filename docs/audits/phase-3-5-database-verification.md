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
| Supabase CLI link | Available | Project owner linked dev project `hhfcmcopjvyitjxcrmoy`. |
| Remote project ref | Confirmed dev by project owner | Remote push was approved only after explicit confirmation that the linked project is dev. |
| Remote migration push | Completed | `npx supabase db push` applied all local migrations to the linked dev project. |

## 4. Migration helper ordering check

The pre-Phase 3.5 chain had a real ordering issue:

- `202604200007_marketplace_operations_reset.sql` references `public.is_admin()`.
- `public.is_admin()` was only created later in `202604260008_seller_recovery_foundation.sql`.
- A clean reset would therefore risk failing before the Phase 3 compatibility wrapper could run.

Phase 3.5 fixed this by adding `public.is_admin()` immediately after `public.is_admin_user()` in `202604200002_auth_profile_foundation.sql`. The wrapper delegates to the canonical helper and does not weaken admin checks.

## 5. Seller recovery migration object checklist

The Phase 3 migration contains the expected seller recovery objects:

| Object | Migration state | Verification state |
|---|---|---|
| `seller_profiles.support_email` | Added if missing | Verified through dev push and generated types |
| `seller_profiles.business_email` | Added if missing | Verified through dev push and generated types |
| `seller_profiles.phone` | Added if missing | Verified through dev push and generated types |
| `seller_profiles.country_code` | Added if missing | Verified through dev push and generated types |
| `seller_profiles.agreement_accepted_at` | Added if missing | Verified through dev push and generated types |
| `seller_profiles.rejection_reason` | Added if missing | Verified through dev push and generated types |
| `seller_profiles.suspension_reason` | Added if missing | Verified through dev push and generated types |
| `seller_profiles.resubmitted_at` | Added if missing | Verified through dev push and generated types |
| `seller_profiles.approved_at` | Confirmed/added if missing | Verified through dev push and generated types |
| `seller_profiles.approved_by` | Confirmed/added if missing with FK guard | Verified through dev push and generated types |
| `seller_status_history` | Created if missing with seller, actor, reason, and timestamp fields | Verified through dev push and generated types |
| `products.low_stock_threshold` | Added if missing with default `5` | Verified through dev push and generated types |
| `products_low_stock_threshold_non_negative` | Added if missing | Verified through dev push |
| `public.is_admin_user()` | Existing canonical helper | Verified through dev push and generated types |
| `public.is_admin()` | Added early for compatibility and repeated in Phase 3 migration | Verified through dev push and generated types |

Indexes in the Phase 3 migration cover seller profile country/support email/resubmission lookups, seller status history seller/actor/date lookups, and seller low-stock product queries.

## 6. Migration verification result

| Command | Result | Notes |
|---|---|---|
| `docker info --format '{{.ServerVersion}}'` | Failed | Docker daemon/API pipe is unavailable. |
| `npx supabase migration list` | Timed out before project owner relinked | Replaced by dry run and explicit dev push after project owner confirmation. |
| `npx supabase db reset` | Failed before migration execution | Local Supabase could not inspect `supabase_db_multi-vendor-marketplace` because Docker Desktop is unavailable. |
| `npx supabase db push --dry-run` | Passed | Reported all eight local migrations would be pushed. |
| `npx supabase db push` | Passed | Applied all eight migrations to linked dev project `hhfcmcopjvyitjxcrmoy`. |

Migration SQL was applied to the linked dev project after the project owner confirmed it was safe. Local fresh reset remains unavailable until Docker Desktop is running.

## 7. Type generation result

| Command | Result | Notes |
|---|---|---|
| `npx supabase gen types typescript --local` | Failed | Same Docker/local Supabase blocker as reset. |
| `npx supabase gen types typescript --project-id hhfcmcopjvyitjxcrmoy > src/types/database.ts` | Passed | Types were regenerated from the linked dev database. |

`src/types/database.ts` was regenerated from Supabase CLI output and was not hand-edited.

## 8. Application checks

| Command | Result | Notes |
|---|---|---|
| `npm run lint` | Passed | No code changes were needed. |
| `npm run typecheck` | Passed | Ran against regenerated database types. |
| `npm run build` | Passed | Build completed; existing catalog demo-data fallback warnings remain. |

## 9. Remaining risks

- Local fresh reset is still unavailable until Docker Desktop is running.
- The remote dev push applied the chain to an existing dev database, so it is not a substitute for an empty local reset when Docker becomes available.
- Existing catalog build warnings about `cookies()` during static generation remain outside this seller database phase.

## 10. Phase 4 gate

Phase 4 is unblocked for seller registration implementation against the linked dev schema and regenerated types.

When Docker Desktop becomes available, still run a local `npx supabase db reset` as an additional clean-room check.
