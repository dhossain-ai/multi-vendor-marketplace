# Phase 13.5 — Address Migration Verification and Typegen Unblock

## 1. Purpose

Verify the Phase 13 customer address migration against the linked Supabase dev project, regenerate real Supabase types, and identify any type fallout before Phase 14 checkout address integration.

Phase 13.5 does not implement checkout address selection or order address snapshot population.

## 2. Verification environment

- Local workspace: `w:\multi-vendor-marketplace`
- Linked Supabase project ref: `hhfcmcopjvyitjxcrmoy`
- `npx supabase projects list`: confirmed the linked dev project.
- `npx supabase status`: failed because Docker Desktop/local Supabase is not available; this is not required for remote dev project verification.

Baseline checks before migration/typegen work:

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed with the known catalog `cookies()` static-generation/demo fallback warnings.

## 3. Migration inspected

Inspected:

- `supabase/migrations/202604280001_customer_addresses.sql`

The migration creates `public.addresses` with:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references public.profiles(id) on delete cascade`
- `label text`
- `recipient_name text not null`
- `line_1 text not null`
- `line_2 text`
- `city text not null`
- `state_region text`
- `postal_code text`
- `country_code text not null`
- `phone text`
- `is_default boolean not null default false`
- `created_at timestamptz not null default timezone('utc', now())`
- `updated_at timestamptz not null default timezone('utc', now())`
- `addresses_country_code_format` check constraint for two-letter uppercase country codes

The migration also uses the existing `public.set_updated_at()` trigger pattern.

## 4. Migration verification result

- `npx supabase migration list` before push showed `202604280001` pending remotely.
- `npx supabase db push --dry-run` succeeded and reported only `202604280001_customer_addresses.sql` would be pushed.
- `npx supabase db push` succeeded and applied `202604280001_customer_addresses.sql`.
- `npx supabase migration list` after push showed `202604280001` present locally and remotely.

No migration correction was required.

## 5. Address schema confirmation

Remote SQL inspection through `npx supabase db query --linked` confirmed:

- `public.addresses` exists.
- All expected columns exist with the expected nullability and defaults.
- Primary key `addresses_pkey` exists on `id`.
- Foreign key `addresses_user_id_fkey` references `profiles(id)` with `on delete cascade`.
- `addresses_country_code_format` exists.
- `addresses_user_id_idx` exists.
- `addresses_user_default_idx` exists.
- `addresses_one_default_per_user_uidx` exists as a unique partial index enforcing at most one default address per user.
- Trigger `addresses_set_updated_at` exists and executes `set_updated_at()`.
- `orders.shipping_address_snapshot` and `orders.billing_address_snapshot` still exist as nullable `jsonb` columns for Phase 14.

## 6. RLS and ownership confirmation

Remote SQL inspection confirmed RLS is enabled on `public.addresses`.

Policies confirmed:

- `addresses_select_owned_or_admin`
- `addresses_insert_owned_or_admin`
- `addresses_update_owned_or_admin`
- `addresses_delete_owned_or_admin`

Each policy is scoped to `authenticated` users and requires `user_id = auth.uid()` or the existing `public.is_admin_user()` trusted admin helper. No anonymous address access was added.

## 7. Type generation result

Pending.

## 8. Type fallout fixes

Pending.

## 9. Quality checks

Baseline checks passed before migration/typegen work.

Final checks are pending.

## 10. Remaining risks

- Type generation still needs to be completed from the linked dev project.
- Phase 14 still needs checkout address selection and `orders.shipping_address_snapshot` population.
- The known catalog `cookies()` static-generation/demo fallback warning remains intentionally deferred.

## 11. Phase 14 readiness

Pending type generation and final quality checks.
