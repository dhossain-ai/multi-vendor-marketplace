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

## 5. Seller recovery migration object checklist

The Phase 3 migration contains the expected seller recovery objects:

| Object | Migration state | Verification state |
|---|---|---|
| `seller_profiles.support_email` | Added if missing | Pending database reset/apply |
| `seller_profiles.business_email` | Added if missing | Pending database reset/apply |
| `seller_profiles.phone` | Added if missing | Pending database reset/apply |
| `seller_profiles.country_code` | Added if missing | Pending database reset/apply |
| `seller_profiles.agreement_accepted_at` | Added if missing | Pending database reset/apply |
| `seller_profiles.rejection_reason` | Added if missing | Pending database reset/apply |
| `seller_profiles.suspension_reason` | Added if missing | Pending database reset/apply |
| `seller_profiles.resubmitted_at` | Added if missing | Pending database reset/apply |
| `seller_profiles.approved_at` | Confirmed/added if missing | Pending database reset/apply |
| `seller_profiles.approved_by` | Confirmed/added if missing with FK guard | Pending database reset/apply |
| `seller_status_history` | Created if missing with seller, actor, reason, and timestamp fields | Pending database reset/apply |
| `products.low_stock_threshold` | Added if missing with default `5` | Pending database reset/apply |
| `products_low_stock_threshold_non_negative` | Added if missing | Pending database reset/apply |
| `public.is_admin_user()` | Existing canonical helper | Pending database reset/apply |
| `public.is_admin()` | Added early for compatibility and repeated in Phase 3 migration | Pending database reset/apply |

Indexes in the Phase 3 migration cover seller profile country/support email/resubmission lookups, seller status history seller/actor/date lookups, and seller low-stock product queries.

## 6. Migration verification result

| Command | Result | Notes |
|---|---|---|
| `docker info --format '{{.ServerVersion}}'` | Failed | Docker daemon/API pipe is unavailable. |
| `npx supabase migration list` | Failed | Supabase CLI reports the project is not linked. |
| `npx supabase db reset` | Failed before migration execution | Local Supabase could not inspect `supabase_db_multi-vendor-marketplace` because Docker Desktop is unavailable. |

No migration SQL was applied during Phase 3.5. The helper-order defect was corrected in the migration files, but the full chain still requires a real reset against local Supabase or a confirmed disposable dev project.

## 7. Type generation result

| Command | Result | Notes |
|---|---|---|
| `npx supabase gen types typescript --local` | Failed | Same Docker/local Supabase blocker as reset. |

`src/types/database.ts` was not regenerated and was intentionally not hand-edited.

## 8. Application checks

| Command | Result | Notes |
|---|---|---|
| `npm run lint` | Passed | No code changes were needed. |
| `npm run typecheck` | Passed | Ran against the current, not regenerated, database types. |
| `npm run build` | Passed | Build completed; existing catalog demo-data fallback warnings remain. |

## 9. Remaining risks

- Full migration-chain application is still unverified because local Supabase cannot run without Docker.
- The Phase 3 seller recovery migration is syntactically reviewed but not applied to a database in this environment.
- `src/types/database.ts` remains stale and does not include the Phase 3 seller recovery schema.
- A remote Supabase URL is present in app env, but the repository is not CLI-linked and there is no local proof that the remote project is disposable/dev.
- Phase 4 code built now would either need temporary hand-written type workarounds or would rely on stale schema assumptions.

## 10. Phase 4 gate

Phase 4 is not unblocked yet.

Before building `/seller/register`, run one of these verified paths:

1. Start Docker Desktop/local Supabase, run `npx supabase db reset`, then run `npx supabase gen types typescript --local > src/types/database.ts`.
2. Link a confirmed disposable dev Supabase project, run the safest migration verification path for that project, then run `npx supabase gen types typescript --project-id <DEV_PROJECT_ID> > src/types/database.ts`.

Do not use the existing remote URL for migration pushes unless the project owner confirms it is non-production and safe for destructive/dev schema verification.
