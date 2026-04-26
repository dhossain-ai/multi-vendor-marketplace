# Phase 1 — Seller Code Audit

## 1. Purpose

Audit the current seller/vendor implementation against `docs/blueprint/02-seller-flow.md` and the final Phase 1 seller-flow decisions. This document identifies what can be kept, what needs refactoring, what is missing, and what should wait for later phases.

This phase is audit-only. No implementation files, migrations, UI behavior, or business logic were changed.

## 2. Audit scope

Inspected areas:

- `docs/blueprint/02-seller-flow.md`
- `src/app/seller/`
- `src/app/sell/`
- `src/features/seller/`
- `src/app/admin/sellers/`
- `src/features/admin/`
- `src/lib/auth/`
- `src/lib/supabase/`
- `src/types/database.ts`
- `supabase/migrations/`

## 3. Source of truth

Primary source of truth:

- `docs/blueprint/02-seller-flow.md`

Additional target decisions applied during this audit:

- Public UI should use `Seller`.
- Internal code/database should use `seller`.
- New seller registration route should be `/seller/register`.
- `/sell` may later become a public marketing/landing page.
- Verified email should be required before approval/activation.
- Rejected sellers can edit and resubmit; status returns to `pending`.
- Rejection/suspension reasons should be seller-visible in safe wording.
- Suspended sellers' public products should be hidden immediately.
- Suspended sellers cannot use normal operations in MVP; admin handles affected orders.
- Store slug is editable before approval only.
- MVP seller application fields are store name, store slug, store description, support email, country, and agreement checkbox.
- Product publish requires at least one image/thumbnail; drafts can be saved without image.
- Out-of-stock products stay visible but not purchasable.
- Default low-stock threshold is `5`.
- Seller cancellation of paid order items is admin-only.
- Sellers should not see customer email by default.
- Seller dashboard should show all-time and last-30-days gross sales.

## 4. Current seller route map

| Route | Current behavior | Target behavior | Status | Notes |
|---|---|---|---|---|

## 5. Current seller feature module audit

| File/module | Responsibility | Keep | Refactor | Remove | Notes |
|---|---|---:|---:|---:|---|

## 6. Current admin seller review audit

| Area | Current behavior | Target behavior | Gap/Risk |
|---|---|---|---|

## 7. Auth and permission audit

| Rule | Current implementation | Target behavior | Status | Risk |
|---|---|---|---|---|

## 8. Seller database and type audit

| Table/type/migration | Current state | Target need | Status | Notes |
|---|---|---|---|---|

## 9. Seller lifecycle audit

| Lifecycle state | Current support | Target support | Gap |
|---|---|---|---|

## 10. Seller product/inventory audit

| Capability | Current support | Target support | Gap |
|---|---|---|---|

## 11. Seller order/fulfillment audit

| Capability | Current support | Target support | Gap |
|---|---|---|---|

## 12. Code quality risks

## 13. Security risks

## 14. Database/schema risks

## 15. UX/product coherence risks

## 16. Keep / Refactor / Remove / Missing / Later summary

### Keep

### Refactor

### Remove

### Missing

### Later

## 17. Recommended Phase 2 scope

## 18. Do-not-touch-yet list

## 19. Open questions/blockers
