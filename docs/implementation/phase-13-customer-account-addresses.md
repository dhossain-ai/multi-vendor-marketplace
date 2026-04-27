# Phase 13 — Customer Account and Address Management

## Summary

Phase 13 implemented the customer account depth identified by the Phase 12 audit:

- `/account/profile`
- `/account/addresses`
- customer profile editing
- customer-owned address book management
- default shipping address behavior
- checkout default-address preview and snapshot preparation

Checkout address selection and order shipping snapshots are intentionally left for Phase 14.

## Routes Added or Changed

- Added `/account/profile`
  - requires authentication
  - shows email and role as read-only
  - allows editing `profiles.full_name`
- Added `/account/addresses`
  - requires authentication
  - lists the signed-in customer's addresses
  - supports create, edit, delete, and set-default actions
- Updated `/account`
  - links to profile, address book, orders, seller entry, and admin only when applicable
  - removes developer-facing fallback copy
- Updated `/checkout`
  - loads the customer's default address when available
  - shows a non-blocking shipping-address preview and address-book link
  - does not require an address yet

## Schema and Migration

Added migration:

- `supabase/migrations/202604280001_customer_addresses.sql`

The migration creates `public.addresses` with:

- customer ownership via `user_id references public.profiles(id) on delete cascade`
- label, recipient, address lines, city, state/region, postal code, country code, and phone fields
- `is_default`
- `created_at` and `updated_at`
- an `updated_at` trigger using the existing `public.set_updated_at()`
- owner/admin RLS policies for select, insert, update, and delete
- indexes for user lookup and default-address lookup
- a unique partial index enforcing at most one default address per user

## Type Generation

Supabase CLI version:

- `npx supabase --version` passed with `2.95.5`

Type generation status:

- `npx supabase gen types typescript --local` failed because Docker Desktop is unavailable.
- `npx supabase db push --dry-run` timed out.
- `npx supabase db push --dry-run --debug` also timed out.

Because the repo currently tracks a hand-maintained/generated-shaped schema subset, `src/types/database.ts` was updated narrowly to include `public.addresses`. Types were not regenerated from Supabase in this environment.

## Profile Behavior

- Profile update is handled by `updateProfileAction`.
- The authenticated Supabase session derives the user id.
- The form does not accept `user_id`.
- The form does not allow email, role, seller status, admin fields, order state, or payment state mutation.
- `full_name` is trimmed, optional, and capped at 120 characters.
- Successful updates revalidate `/account` and `/account/profile`.

## Address Behavior

- Address actions are handled by:
  - `createAddressAction`
  - `updateAddressAction`
  - `deleteAddressAction`
  - `setDefaultAddressAction`
- Address repository methods always filter by `user_id`:
  - `listAddressesForUser`
  - `getAddressForUser`
  - `createAddressForUser`
  - `updateAddressForUser`
  - `deleteAddressForUser`
  - `setDefaultAddressForUser`
  - `getDefaultAddressForUser`
- Address forms validate and normalize:
  - required recipient name
  - required line 1
  - required city
  - two-letter uppercase country code
  - optional label, line 2, state/region, postal code, and phone

## Default Address Behavior

- The first created address becomes default automatically.
- Creating a new default unsets the previous default first.
- Editing an address can make it the default.
- Setting default uses a dedicated action.
- Deleting a default address leaves the customer with no default until they set another one.
- The database also enforces at most one default address per user.

Default switching currently uses safe sequential updates from application code rather than a single database transaction. A transaction/RPC can harden this later if needed.

## Security and Ownership

- Customer identity is always derived from the authenticated server session.
- `user_id` is never accepted from client form input.
- All address reads and writes include a `user_id` filter.
- Address RLS allows customers to access only their own rows.
- Admin visibility is preserved through the existing `public.is_admin_user()` helper.
- Profile editing only mutates `profiles.full_name`.

## Checkout Snapshot Preparation

- Checkout now fetches the customer's default address and displays it as a preview.
- Checkout does not yet select an address or require a saved address.
- Checkout does not populate `orders.shipping_address_snapshot` in this phase.
- `buildShippingAddressSnapshot()` was added so Phase 14 can snapshot a selected customer-owned address without inventing address data.

## Quality Checks

Baseline before Phase 13:

- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm run build` passed with the known catalog static-generation/demo fallback warnings.

Implementation checks during Phase 13:

- `npm run typecheck` passed after profile work.
- `npm run typecheck` passed after address repository/actions.
- `npm run lint` and `npm run typecheck` passed after address book UI.
- `npm run lint` and `npm run typecheck` passed after account/checkout integration.

Final verification:

- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm run build` passed with the known catalog static-generation/demo fallback warnings from `cookies()` during static catalog generation.

## Remaining Phase 14 Follow-ups

- Add checkout address selection.
- Require or validate shipping address according to the final customer checkout rules.
- Populate `orders.shipping_address_snapshot` from a selected customer-owned address.
- Decide whether billing address remains deferred or mirrors shipping for MVP.
- Show order shipping snapshot on customer order detail once populated.
- Consider transactional/RPC default-address switching if production concurrency requirements demand it.
