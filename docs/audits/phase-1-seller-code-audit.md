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
| `/seller/register` | No route found. | Public seller registration/application route. Should support new seller application entry and use Seller copy. | MISSING | Required by final decision. Current application entry is `/sell`. |
| `/sell` | Auth-gated application page. Requires authenticated user, blocks admins, redirects existing seller profiles to `/seller` or `/seller/settings`, renders `SellerStoreSetupView` for new applications. | Later public marketing/landing page; application flow should move to `/seller/register`. | REFACTOR | Useful flow exists, but route responsibility is wrong for target. |
| `/seller` | Seller-role-only dashboard. Loads summary only when `sellerProfile.status === "approved"`; otherwise renders status messaging. | Seller workspace should show status-aware behavior, but no-profile users should be guided to apply. | REFACTOR | `requireSellerRole` blocks normal customer/no-profile users before the no-profile dashboard state can render. |
| `/seller/settings` | Seller-role-only settings/application page. Renders apply mode when no seller profile, edit mode otherwise. | Store/application settings for current seller; rejected sellers can edit and resubmit to `pending`; approved sellers cannot self-edit slug. | REFACTOR | Apply mode is mostly unreachable for normal customers because layout and page require seller role. Slug remains editable after approval. |
| `/seller/products` | Seller-role route gated to approved seller profile. Lists seller-scoped products. | Approved-only product list with draft/active/archived/suspended visibility and status labels. | KEEP | Status gate and seller-profile id scoping align with blueprint. Needs later dashboard/count alignment, not route rebuild. |
| `/seller/products/new` | Seller-role route gated to approved status. Renders product form with active categories. | Approved-only product creation. Publish requires valid category, stock, price, and at least one image/thumbnail. | REFACTOR | Approved gate is good; publish image requirement is missing. |
| `/seller/products/[id]/edit` | Seller-role route gated to approved status. Fetches product by current seller profile id; 404 when not owned/found. | Approved-only edit with ownership checks; suspended products cannot be seller-edited. | KEEP | Route and repository ownership checks are aligned. Product validation still needs target-rule updates. |
| `/seller/orders` | Seller-role route gated to approved status. Lists orders derived from seller-owned order items. | Approved-only seller-scoped order list, only own line items, no customer email by default. | REFACTOR | Seller scoping is good; order list lacks fulfillment-needs dashboard semantics and privacy review. |
| `/seller/orders/[id]` | Seller-role route gated to approved status. Fetches detail by seller profile id and order id; 404 when no owned items. | Seller-scoped detail showing only own line items and fulfillment controls; no seller cancellation of paid items. | REFACTOR | Scoping is good, but current UI/action allows `cancelled` fulfillment path. |
| `/admin/sellers` | Admin sellers list with status filter and inline approve/reject/suspend/reactivate-style buttons. | Admin pending list, seller detail review, approve, reject/suspend/reactivate with required safe reasons and audit/history. | REFACTOR | Basic list/status mutation exists. Missing detail review, reason capture, seller-visible wording, and verified-email approval gate. |

## 5. Current seller feature module audit

| File/module | Responsibility | Keep | Refactor | Remove | Notes |
|---|---|---:|---:|---:|---|
| `src/features/seller/types.ts` | Seller product, store profile, order, fulfillment, and dashboard view-model types. | Y | Y | N | KEEP core shape. REFACTOR to add support email, country, agreement, low-stock count, recent orders, all-time and 30-day gross sales, and remove seller cancellation from seller fulfillment input. |
| `src/features/seller/lib/seller-status.ts` | Status labels and safe dashboard messaging for pending/approved/rejected/suspended. | Y | Y | N | KEEP status map. REFACTOR to display seller-visible rejection/suspension reasons once schema supports them and to support rejected resubmission copy. |
| `src/features/seller/lib/seller-profile-repository.ts` | Creates seller application, updates profile, maps `seller_profiles`. | Y | Y | N | KEEP duplicate profile prevention and internal `seller_profiles` naming. REFACTOR for required fields, agreement capture, verified-email approval workflow support, rejected resubmission back to `pending`, and slug edit rules. |
| `src/features/seller/lib/seller-actions.ts` | Server actions for application/profile, products, archive, and fulfillment. | Y | Y | N | KEEP server-derived seller profile id for product/order actions. REFACTOR application route target, required field validation, product publish image rule, approved-only checks for profile operations, and seller cancellation removal. |
| `src/features/seller/lib/seller-dashboard-repository.ts` | Aggregates product counts and gross sales from seller-owned rows. | Y | Y | N | KEEP seller-scoped aggregation. REFACTOR to include low-stock count, orders needing fulfillment, recent orders, all-time gross sales, last-30-days gross sales, and correct currency handling. |
| `src/features/seller/lib/seller-product-repository.ts` | Lists, loads, creates, updates, archives seller-owned products and syncs images. | Y | Y | N | KEEP ownership checks and server-assigned `seller_id`. REFACTOR publish validation/image requirements, low-stock threshold support, out-of-stock visibility semantics, and product image ownership/delete safety. |
| `src/features/seller/lib/seller-order-repository.ts` | Builds seller-scoped order summaries/details and updates fulfillment on seller-owned order items. | Y | Y | N | KEEP seller item scoping. REFACTOR to hide customer email by default, add shipping recipient/address/phone model, and remove seller `cancelled` transition for paid items. |
| `src/features/seller/components/seller-dashboard-view.tsx` | Status-aware seller dashboard and approved summary cards/quick actions. | Y | Y | N | KEEP status-aware layout. REFACTOR metrics to target dashboard requirements and no-profile/customer application flow. |
| `src/features/seller/components/seller-store-profile-form.tsx` | Store application/settings form. | Y | Y | N | KEEP simple store form. REFACTOR for support email, country, agreement checkbox, rejected resubmission, and disabling slug after approval. |
| `src/features/seller/components/seller-store-setup-view.tsx` | Store setup wrapper and status guidance. | Y | Y | N | KEEP status guidance. REFACTOR copy/actions around rejected resubmission and suspended lockout once reasons exist. |
| `src/features/seller/components/seller-product-form.tsx` | Product create/edit form including price, stock, category, status, images. | Y | Y | N | KEEP major product fields. REFACTOR to require image on publish, represent low-stock threshold if added, and avoid URL-only image assumptions later. |
| `src/features/seller/components/seller-products-view.tsx` | Product list, inventory labels, edit/archive actions. | Y | Y | N | KEEP stock labels and archive controls. REFACTOR to align out-of-stock visible/not-purchasable semantics and product status wording. |
| `src/features/seller/components/seller-orders-view.tsx` | Seller order list UI. | Y | Y | N | KEEP seller order list. REFACTOR for fulfillment-needs emphasis and privacy-limited customer/shipping display. |
| `src/features/seller/components/seller-order-detail-view.tsx` | Seller order detail and fulfillment forms. | Y | Y | N | KEEP own-item fulfillment UI structure. REFACTOR to remove seller cancellation, require/validate tracking policy, and hide customer email unless explicitly needed. |
| `src/features/seller/components/seller-status-gate.tsx` | Approved-status gate and messaging for non-approved seller states. | Y | Y | N | KEEP reusable gate. REFACTOR CTA targets around `/seller/register` and rejected resubmission. |
| `src/features/seller/components/seller-nav.tsx` | Seller workspace navigation. | Y | N | N | KEEP. Routes are target seller workspace routes except missing `/seller/register`. |

## 6. Current admin seller review audit

| Area | Current behavior | Target behavior | Gap/Risk |
|---|---|---|---|
| Seller application list | `/admin/sellers` loads `seller_profiles`, owner email/name, status, bio, slug, approval fields, and product count. Supports status filter. | Pending seller list with status filters, submitted/updated dates, applicant identity, review context, product count, and quick actions. | REFACTOR: list foundation is useful, but no default pending-first review workflow, no search/date filters, and limited application fields because schema is thin. |
| Seller detail review | Current UI is card/list based. No dedicated seller detail page or expanded review history. | Seller detail review with account identity, store info, business/contact fields, terms acceptance, current status, previous review history, product/order summary. | MISSING: admins cannot inspect all required review evidence from a seller detail view. |
| Approve | Inline form posts `sellerId` and `status=approved`. Repository validates allowed transition, sets `approved_at` and `approved_by`, writes audit log. | Approve with verified email precondition, reason/audit history, and unlock approved operations. | REFACTOR/RISK: status transition and audit exist, but no verified-email gate and no explicit approval reason/context. |
| Reject with reason | Inline form posts `status=rejected`; action passes generated reason `Admin set seller status to rejected.`. Approval fields are cleared. | Reject requires reason and safe seller-visible wording; rejected sellers can edit and resubmit to `pending`. | REFACTOR: no entered reason, no seller-visible reason, no resubmission-to-pending support. |
| Suspend with reason | Inline form posts `status=suspended`; action passes generated reason. | Suspend requires reason, seller-visible safe wording, immediate public product hiding, and locked seller operations. | REFACTOR/RISK: status changes to suspended, but there is no reason capture and product hiding depends on public catalog policies rather than an explicit suspension side effect. |
| Reactivate | UI labels `approved` from rejected/suspended as `Reactivate`; repository transition sets `approved_at` and `approved_by`. | Reactivate suspended/rejected seller with reason/history and without automatically reactivating archived/suspended products. | REFACTOR: transition exists, but no reason input and no clear product-status review on reactivation. |
| Audit/history | `recordAdminAuditLog` inserts before/after snapshots and reason into `admin_audit_logs`. Errors are logged but not thrown. | Append-only audit/history should be reliable enough that lifecycle status is not silently changed without audit. | RISK: audit log failure does not fail the seller status change, so lifecycle history can become incomplete. |
| Status transition rules | Allowed transitions are `pending -> approved/rejected/suspended`, `approved -> suspended`, `rejected -> approved/suspended`, `suspended -> approved/rejected`. | Final decision adds rejected resubmission returning to `pending`; admin transitions still need reason. | REFACTOR: repository disallows returning rejected to pending, and no resubmission concept exists. |
| Admin authorization | `updateSellerStatusAction` calls `requireAdminRole("/admin/sellers")`. | Admin-only seller review and status mutations protected server-side. | KEEP: server-side admin role check exists. |
| Seller owner data exposure to admins | Admin list shows owner name/email. | Admins should see review identity/contact details. | KEEP: appropriate for admin view, but needs additional required application fields. |
| Seller-visible decision messaging | Seller status labels are generic. No stored reason is exposed to seller. | Rejection/suspension reasons should be visible in safe wording. | MISSING: no seller-visible reason field or display path. |

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
