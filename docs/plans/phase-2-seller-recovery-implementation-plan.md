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

### Phase 4 — Seller registration and application flow

### Phase 5 — Admin seller review and status history

### Phase 6 — Seller dashboard and store settings

### Phase 7 — Seller product and inventory rules

### Phase 8 — Seller order privacy and fulfillment rules

### Phase 9 — Seller QA, security, and cleanup

## 7. Database delta plan

| Area | Current issue | Required change | Migration needed | Notes |
|---|---|---|---|---|

## 8. Table and field plan

### profiles

### seller_profiles

### seller_status_history

### products

### product_images

### orders

### order_items

### admin_audit_logs

## 9. RLS and security plan

## 10. Generated Supabase types plan

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
