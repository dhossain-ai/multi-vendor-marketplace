# Phase 2 — Seller Recovery Implementation Plan

## 1. Purpose

This plan converts the seller blueprint and Phase 1 code audit into an ordered implementation roadmap. It defines the database, type, route, server action, UI, security, QA, and cleanup work needed to recover the seller flow into a client-ready marketplace MVP.

This document is planning-only. It does not contain SQL, code patches, route changes, UI changes, generated types, or refactors.

## 2. Inputs reviewed

- `docs/blueprint/02-seller-flow.md`
- `docs/audits/phase-1-seller-code-audit.md`
- Current seller/admin/auth implementation reality under the Phase 2 inspection scope.

## 3. Final seller-flow decisions

- Use `seller` internally in code and database.
- Public UI should say `Seller` unless the client later requests `Vendor`.
- The new seller registration route is `/seller/register`.
- `/sell` becomes a public seller landing/marketing entry page later.
- Seller approval/activation requires verified email.
- Rejected sellers can edit and resubmit; resubmission sets status back to `pending`.
- Rejection and suspension reasons are seller-visible using safe wording.
- Suspended sellers' public products are hidden immediately.
- Suspended sellers cannot use normal seller operations in MVP; admin handles affected orders.
- Store slug is editable before approval only.
- Required seller MVP fields: store name, store slug, store description, support email, country, agreement checkbox.
- Optional seller MVP fields: business email, phone.
- Product publish requires at least one thumbnail/image.
- Draft products can be saved without image.
- Out-of-stock products stay visible but not purchasable.
- Default low-stock threshold is `5`.
- Seller cancellation of paid order items is removed for MVP; cancellation is admin-only.
- Sellers should not see customer email by default.
- Sellers may see shipping recipient/address/phone only when needed for fulfillment.
- Seller dashboard shows all-time gross sales and last-30-days gross sales.

## 4. Critical risks from Phase 1

- `/seller/register` is missing.
- `/sell` currently performs application work but should become a later marketing route.
- Seller profile schema is missing required MVP fields and safe decision reasons.
- Rejected resubmission to `pending` is missing.
- Admin approval does not enforce verified email.
- Seller cancellation of paid order items is currently available.
- Seller order detail exposes customer email and omits shipping snapshot fields needed for fulfillment.
- `profiles.is_active` is not enforced by auth guards.
- Seller profile update rules are too broad by lifecycle state.
- `202604200007_marketplace_operations_reset.sql` references `public.is_admin()` although the existing helper appears to be `public.is_admin_user()`.
- Handwritten database types can drift from migrations.

## 5. Implementation strategy

Implement recovery from the database upward. First make the data model capable of expressing the approved product decisions, then update generated types, then route application and admin review through the new lifecycle rules, then update seller dashboard/products/orders, and finally run security/QA cleanup.

Each future implementation phase should be shippable, testable, and limited to one recovery layer. Avoid mixing schema changes with route/UI rewrites unless a phase explicitly depends on both.

## 6. Phase breakdown

### Phase 3 — Seller database and type foundation

Goal: create the schema and type foundation needed by the recovered seller flow, without changing seller UI behavior yet.

Planned work:

- Add seller application fields to `seller_profiles`.
- Add seller-visible decision reason fields.
- Add rejected resubmission timestamp support.
- Add a queryable `seller_status_history` table.
- Add product low-stock threshold support.
- Fix the RLS helper naming mismatch if confirmed.
- Align seller profile RLS with intended self-update rules.
- Regenerate Supabase database types after migrations are applied.

### Phase 4 — Seller registration and application flow

### Phase 5 — Admin seller review and status history

### Phase 6 — Seller dashboard and store settings

### Phase 7 — Seller product and inventory rules

### Phase 8 — Seller order privacy and fulfillment rules

### Phase 9 — Seller QA, security, and cleanup

## 7. Database delta plan

| Area | Current issue | Required change | Migration needed | Notes |
|---|---|---|---|---|
| Seller application fields | `seller_profiles` lacks support email, country, agreement acceptance, optional business email, and phone. | Add fields needed by MVP application/review. | Yes | Keep fields on `seller_profiles` for MVP simplicity. Avoid separate business profile table until complexity warrants it. |
| Seller-visible decision reasons | Rejection/suspension reasons are not stored on seller profile. | Add safe seller-visible reason fields. | Yes | Use safe wording only. Internal admin notes can live in history/audit metadata. |
| Rejected resubmission | No timestamp or lifecycle marker for resubmission. | Add `resubmitted_at` and status history entry when rejected seller resubmits. | Yes | Resubmission changes `status` from `rejected` to `pending`. |
| Seller status history | No dedicated, queryable seller lifecycle history. | Create `seller_status_history`. | Yes | Use in admin detail and seller-facing decision display. Continue writing `admin_audit_logs` for platform audit. |
| Email verification approval gate | `profiles` does not mirror auth email verification. | Plan approval check against Supabase auth user state or a mirrored field. | Maybe | Preferred MVP: admin approval server action queries auth user verification directly before setting approved. Mirror later only if needed. |
| Product low stock threshold | `products` has stock fields but no threshold. | Add `low_stock_threshold integer not null default 5`. | Yes | Default matches final decision. Validate non-negative or positive. |
| Product publish image requirement | Schema supports images but does not enforce publish requirement. | Enforce in server validation, not DB constraint. | No | DB cannot easily validate thumbnail-or-image across `product_images` without triggers. Keep application-level rule. |
| Out-of-stock visible | Public visibility does not check stock; current app blocks active zero-stock products. | Keep public visibility independent from stock; enforce non-purchasable in cart/checkout/product actions. | Maybe | Product validation changes may not need migration beyond threshold. Checkout stock validation may be separate phase. |
| Fulfillment RLS helper mismatch | Migration references `public.is_admin()`; helper found is `public.is_admin_user()`. | Add/fix policy to use the correct helper. | Yes | Do not edit old migration; add a forward migration. |
| Seller profile self-update RLS | Existing policy appears admin-only; app uses service-role fallback. | Add explicit policy for owner updates to allowed application/profile fields, or keep service-role with strict server checks. | Yes if RLS policy changes | Preferred: add safer authenticated owner policy where feasible and keep app-level status checks. |
| Audit logging reliability | Audit insert failure is swallowed. | Later code should make lifecycle mutation and history/audit write consistent. | No schema unless history table added | Use transaction-like ordering where practical in repository phase. |
| Database types | `src/types/database.ts` is handwritten and relationship metadata is empty. | Regenerate Supabase types after migrations. | No migration | Commit generated type changes after schema migration verification. |

## 8. Table and field plan

### profiles

Current role: account identity and role state.

Plan:

- Keep `id`, `email`, `full_name`, `role`, `is_active`, timestamps.
- Do not add seller-specific fields here.
- Enforce `is_active` in auth guards during implementation.
- For email verification, prefer querying Supabase auth user state in admin approval. Add a mirrored field only if querying auth state is impractical or too slow for review.

### seller_profiles

Current role: canonical seller/store/application profile.

Add or confirm fields:

- `support_email text not null`
- `business_email text null`
- `phone text null`
- `country_code text not null`
- `agreement_accepted_at timestamptz not null`
- `rejection_reason text null`
- `suspension_reason text null`
- `resubmitted_at timestamptz null`
- `approved_at timestamptz null`
- `approved_by uuid null references profiles(id)`

Rules:

- Keep `user_id` unique.
- Make `slug` required for new applications if possible, but handle existing null slugs in migration safely.
- Keep slug unique.
- Slug is user-editable only while `status` is `pending` or `rejected` before resubmission.
- Approved slug changes require admin support later.
- `rejection_reason` and `suspension_reason` store seller-visible safe wording. Internal notes go to `seller_status_history.metadata` or `admin_audit_logs`.

### seller_status_history

Create a new table for lifecycle history because admin review needs a direct, queryable seller timeline.

Planned fields:

- `id uuid primary key`
- `seller_profile_id uuid not null references seller_profiles(id)`
- `actor_user_id uuid null references profiles(id)`
- `from_status seller_status null`
- `to_status seller_status not null`
- `reason text null`
- `seller_visible_reason text null`
- `event_type text not null`
- `metadata jsonb not null default '{}'::jsonb`
- `created_at timestamptz not null default now`

Event types:

- `application_submitted`
- `application_resubmitted`
- `seller_approved`
- `seller_rejected`
- `seller_suspended`
- `seller_reactivated`
- `seller_profile_updated`

Usage:

- Admin review detail reads this table for lifecycle history.
- Seller status UI can read the latest seller-visible rejection/suspension reason through `seller_profiles` or a latest history query.
- `admin_audit_logs` remains the broader platform audit trail.

### products

Current role: seller-owned catalog listings.

Plan:

- Add `low_stock_threshold integer not null default 5`.
- Keep `status` enum values: `draft`, `active`, `archived`, `suspended`.
- Keep `thumbnail_url`.
- Keep `is_unlimited_stock` and `stock_quantity`.
- Do not encode publish image requirement as a DB constraint in Phase 3; enforce in server validation.
- Do not hide active zero-stock products at DB visibility level.

### product_images

Current role: gallery images attached to a product.

Plan:

- Keep current shape.
- Continue enforcing ownership through product ownership.
- Later server validation should require either `thumbnail_url` or at least one `product_images` row before publishing.

### orders

Current role: customer-level order record with shipping/billing snapshots.

Plan:

- Keep current order/payment/totals fields.
- Use `shipping_address_snapshot` as source for seller fulfillment recipient/address/phone display.
- Do not expose billing snapshot to sellers.
- Do not add seller-specific order fields unless Phase 8 proves a need.

### order_items

Current role: seller-owned line item and fulfillment unit.

Plan:

- Keep `seller_id`.
- Keep `fulfillment_status`, `tracking_code`, `shipment_note`, `shipped_at`, `delivered_at`.
- Keep `cancelled` enum value for admin/platform workflows, but remove seller access to cancellation.
- Prefer updating selected seller-owned order items rather than blindly updating all seller-owned items in an order, if UI can support item-level controls.

### admin_audit_logs

Current role: broad admin audit table.

Plan:

- Keep for platform-wide audit.
- Continue recording seller lifecycle changes here.
- Add `seller_status_history` for direct seller lifecycle timeline; do not rely only on JSON snapshots in audit logs.
- Future repository logic should not silently accept lifecycle status changes when history/audit recording fails.

## 9. RLS and security plan

Security implementation must combine app-level server checks and database RLS. Because service-role clients bypass RLS, repository code must never rely on RLS alone.

Plan:

- Confirm the fulfillment policy helper mismatch. If `public.is_admin()` is missing, add a forward migration to use `public.is_admin_user()`.
- Add or adjust RLS for `seller_status_history`:
  - Admins can select/insert.
  - Seller owners can select their own history where seller-visible data is safe.
  - Seller owners cannot insert/update/delete history.
- Add or adjust `seller_profiles` owner update policy if the app will stop relying on service-role writes for seller self-updates.
- Keep product and order item policies scoped by approved seller ownership.
- Keep public product visibility dependent on seller approval and active category, so suspended sellers disappear from public catalog immediately.
- Enforce `profiles.is_active` in auth guards before seller/admin operations.
- Enforce approved-only operations in server actions, not only routes/components.
- Never accept `seller_id` from client forms for seller-owned writes.

## 10. Generated Supabase types plan

Types must be regenerated only after Phase 3 migrations are written and applied in a clean local Supabase environment.

Plan:

1. Apply Phase 3 migrations locally.
2. Regenerate `src/types/database.ts` from Supabase.
3. Confirm new fields exist for `seller_profiles`, `seller_status_history`, and `products.low_stock_threshold`.
4. Confirm relationship metadata is present or decide whether the project continues with a manually simplified type.
5. Update seller/admin types to consume generated table types where practical.
6. Commit generated type changes separately from business logic.

Do not generate types during Phase 2.

## 11. Route plan

| Route | Current state | Target state | Action |
|---|---|---|---|

## 12. Server action/repository plan

| Area | Current issue | Target behavior | Action |
|---|---|---|---|

## 13. UI/component plan

| Area | Current issue | Target behavior | Action |
|---|---|---|---|

## 14. Seller registration implementation plan

## 15. Admin seller review implementation plan

## 16. Seller dashboard implementation plan

## 17. Seller product/inventory implementation plan

## 18. Seller order/fulfillment implementation plan

## 19. Cleanup/removal plan

## 20. Testing and QA plan

## 21. Do-not-build-yet list

## 22. Recommended implementation order

## 23. Commit strategy for future implementation phases

## 24. Open blockers
