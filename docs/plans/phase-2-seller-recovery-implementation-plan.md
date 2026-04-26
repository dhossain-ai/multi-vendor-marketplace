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

Goal: move seller application behavior to `/seller/register` and make both new-account and existing-account application flows match the locked decisions.

Planned work:

- Create `/seller/register`.
- Preserve `/sell` for later public seller landing work; during transition it can link or redirect to `/seller/register`.
- Expand application form and validation to required MVP fields.
- Support existing signed-in customer application.
- Support new unauthenticated applicant account creation plus seller application.
- Keep duplicate application prevention.
- Add rejected resubmission that sets status back to `pending`.
- Keep pending/rejected/suspended/approved status-safe messaging.

### Phase 5 — Admin seller review and status history

Goal: make admin review deliberate, auditable, and aligned with lifecycle decisions.

Planned work:

- Add seller detail review route if needed.
- Add reason input for reject, suspend, and reactivate.
- Add verified-email check before approval.
- Write `seller_status_history` entries for all lifecycle transitions.
- Continue writing `admin_audit_logs`.
- Surface safe seller-visible reasons.
- Keep suspended sellers' public products hidden through existing public visibility logic.

### Phase 6 — Seller dashboard and store settings

Goal: make the seller dashboard operational and align store settings with status-specific rules.

Planned work:

- Expand dashboard repository/view-model.
- Add all required dashboard metrics.
- Display safe seller status reasons.
- Make settings form status-aware.
- Disable slug editing after approval.
- Allow rejected resubmission from application/settings flow.
- Keep suspended sellers locked out of normal operations.

### Phase 7 — Seller product and inventory rules

Goal: align product creation/editing/publishing and inventory behavior with the seller blueprint.

Planned work:

- Require image/thumbnail only for publish.
- Keep drafts savable without image.
- Add low-stock threshold display/count using default `5`.
- Allow active out-of-stock products to remain visible but not purchasable.
- Keep approved-only product operations.
- Keep admin-suspended products locked from seller reactivation.

### Phase 8 — Seller order privacy and fulfillment rules

Goal: make seller order handling safe for multi-vendor fulfillment and customer privacy.

Planned work:

- Remove seller-facing cancellation for paid items.
- Hide customer email by default.
- Expose shipping recipient/address/phone only when needed for fulfillment.
- Keep seller order queries scoped to own `order_items`.
- Keep seller unable to mutate payment status.
- Decide and implement item-level fulfillment updates instead of whole seller order slice updates, if feasible.
- Verify fulfillment RLS helper fix from Phase 3.

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
| `/seller/register` | Missing. | Main seller application route for new applicants and existing signed-in users. | CREATE in Phase 4. |
| `/sell` | Auth-gated application page. | Public seller landing/marketing entry page later, not the main application form. | REFACTOR later. In Phase 4, make it point to `/seller/register` or preserve temporarily with clear redirect behavior. |
| `/seller` | Seller-role dashboard; customer/no-profile users are blocked. | Status-aware seller workspace for seller-role users; no-profile users should be guided to `/seller/register` from account/public entry points. | REFACTOR only enough to align status messaging after registration route exists. Keep approved-only operations locked. |
| `/seller/settings` | Seller-role store profile edit/apply page; slug editable in all states. | Seller store settings/application details by status; slug editable only before approval. | REFACTOR in Phase 6. |
| `/seller/products` | Approved-only seller product list. | Keep approved-only product list. | KEEP, then update metrics/status labels in Phase 7 as needed. |
| `/seller/products/new` | Approved-only product create. | Approved-only product create; publish requires image and valid sellability. | REFACTOR validation in Phase 7. |
| `/seller/products/[id]/edit` | Approved-only owned product edit. | Keep ownership checks; prevent seller editing admin-suspended products back to active. | KEEP with validation refinements in Phase 7. |
| `/seller/orders` | Approved-only seller-scoped order list. | Approved-only seller-scoped order list with privacy-safe data. | REFACTOR in Phase 8. |
| `/seller/orders/[id]` | Approved-only seller order detail; currently exposes email and seller cancellation. | Privacy-safe seller detail, own items only, no seller cancellation. | REFACTOR in Phase 8. |
| `/admin/sellers` | Seller list/status actions only. | Seller list with filters/search and link to detail review. | REFACTOR in Phase 5. |
| `/admin/sellers/[id]` | Missing. | Seller detail review with application fields, email verification status, lifecycle history, and actions. | CREATE if list cards cannot carry review safely. Recommended for client-ready admin flow. |

## 12. Server action/repository plan

| Area | Current issue | Target behavior | Action |
|---|---|---|---|
| Seller application action | Current action is tied to `/sell` and only captures store name, slug, bio, logo. | `/seller/register` captures required fields and creates/updates one seller profile. | Split or rename action in Phase 4 after route is created. |
| New applicant account creation | Existing `/sell` requires authenticated user. | Visitor can create auth user/profile and seller profile from `/seller/register`. | Add a dedicated registration action that creates/authenticates user, then creates pending seller profile. |
| Existing user application | Existing signed-in customer can apply through `/sell`; role changes to seller. | Existing signed-in user applies through `/seller/register`; status pending. | Move flow to new route and preserve duplicate prevention. |
| Duplicate application | Existing seller profile errors in repository. | Existing pending/approved/rejected/suspended profiles route to correct status/resubmission behavior. | Replace generic error with status-aware handling. |
| Rejected resubmission | Missing. | Rejected seller edits application and resubmits; status becomes `pending`, `resubmitted_at` set, history written. | Add repository/action path after schema exists. |
| Admin approve | No verified-email gate. | Approve only if auth email is verified; set approval fields; write history and audit. | Refactor `updateSellerStatus` workflow in Phase 5. |
| Admin reject/suspend/reactivate | No reason input; generated reason only. | Require safe seller-visible reason; record lifecycle history and audit. | Add reason-aware admin actions and repository methods. |
| Seller status history | Missing. | Every lifecycle mutation writes `seller_status_history`. | Add repository helper used by application/admin actions. |
| Seller profile updates | Too broad by lifecycle; approved slug editable. | Status-aware allowed fields; slug locked after approval. | Add server-side field whitelist by status. |
| Auth guards | `is_active` not enforced. | Inactive accounts cannot operate. | Update guard behavior in Phase 4 or 5, before broad route changes. |
| Dashboard repository | Current summary lacks low stock, orders needing fulfillment, recent orders, and 30-day sales. | Seller dashboard returns store status, product counts, low-stock count, fulfillment-needs count, recent orders, all-time sales, 30-day sales. | Expand repository in Phase 6 after schema/types are ready. |
| Store settings repository | Current update accepts slug in every lifecycle state. | Slug update allowed only before approval; status-specific field whitelist. | Add status-aware update method in Phase 6. |
| Product validation | Current active product requires stock but not image; active zero-stock limited product is blocked. | Publish requires image/category/price; zero-stock active product can remain visible but checkout blocks purchase. | Refactor validation in Phase 7. |
| Low-stock threshold | No product threshold field. | Use `products.low_stock_threshold`, default `5`. | Add read/write support after Phase 3 migration. |
| Product visibility | Current DB visibility hides suspended sellers through seller status approval check. | Preserve this behavior. | Keep and verify in Phase 7/9. |
| Seller order repository | Current detail exposes customer email and omits shipping snapshot. | Return privacy-safe shipping fulfillment data without default email exposure. | Refactor in Phase 8. |
| Fulfillment update action | Current action accepts `cancelled`. | Seller can update only processing/shipped/delivered transitions; cancellation is admin-only. | Remove seller cancellation path in Phase 8. |
| Fulfillment update target | Current repository updates all seller-owned items in an order for a seller/status update. | Prefer selected seller-owned order item updates, or explicitly document seller-slice update behavior if retained. | Decide and refactor in Phase 8. |
| Payment mutation | Seller code reads payment status and does not update payments. | Preserve no seller payment mutation. | Keep and test. |

## 13. UI/component plan

| Area | Current issue | Target behavior | Action |
|---|---|---|---|
| Seller registration form | Current store form lacks required fields and lives under `/sell`. | `/seller/register` form includes store name, slug, description, support email, country, agreement checkbox, optional business email/phone. | Build in Phase 4 using existing form patterns. |
| Seller status messaging | Generic status messages and no reasons. | Safe rejection/suspension reasons displayed where appropriate. | Update after schema/history support. |
| Admin seller list | List cards have inline status actions but limited review context. | List links to detail review and/or shows pending-first review flow. | Refactor in Phase 5. |
| Admin seller detail | Missing. | Detail view shows account/app fields, verification state, history, and actions with reason inputs. | Create `/admin/sellers/[id]` if needed. |
| Reason input UI | Missing. | Reject/suspend/reactivate require safe reason input. | Add in admin review Phase 5. |
| Approved slug editing | Store form always shows editable slug. | Slug disabled after approval with support/admin guidance. | Refactor in Phase 6. |
| Dashboard metrics | Current dashboard shows total/live/sold/gross sales only. | Show store status, product counts, low stock, fulfillment needs, recent orders, all-time sales, 30-day sales, quick actions. | Refactor in Phase 6. |
| Store settings form | Current fields are name, slug, bio, logo. | Include support email, country, optional business email/phone; status-aware slug editing. | Refactor in Phase 6. |
| Product form publish controls | Current form allows publish without image and blocks zero-stock active products. | Publish requires image; out-of-stock active listings can remain visible but not purchasable. | Refactor in Phase 7. |
| Product inventory labels | Current list has hardcoded low stock threshold `5`. | Use default/per-product threshold consistently and include dashboard low-stock count. | Refactor in Phase 7. |
| Seller order list | Current list is seller-scoped but not focused on fulfillment needs. | Seller order list highlights own items, fulfillment status, and action-needed orders. | Refactor in Phase 8. |
| Seller order detail | Current detail includes cancellation control and customer email. | Show own items, shipping recipient/address/phone as needed, tracking/note controls, no email by default, no cancellation. | Refactor in Phase 8. |
| Fulfillment controls | Current controls include processing, shipped, delivered, cancelled. | Allow processing/shipped/delivered only for seller; cancellation admin-only. | Remove seller cancellation UI in Phase 8. |

## 14. Seller registration implementation plan

### New seller applicant flow

1. Visitor opens `/seller/register`.
2. If unauthenticated, form collects account fields plus seller application fields.
3. Server creates auth user using existing auth patterns.
4. Server ensures/creates `profiles` row.
5. Server creates `seller_profiles` row with:
   - `status = pending`
   - required store/application fields
   - `agreement_accepted_at`
6. Server writes `seller_status_history` event `application_submitted`.
7. User lands on a pending seller status page or `/seller/settings`.
8. Approval remains blocked until email is verified.

### Existing signed-in user flow

1. Signed-in user opens `/seller/register`.
2. If user is admin, block application and show account/admin-safe message.
3. If user has no seller profile, show seller application fields only.
4. Server creates pending seller profile and changes role to `seller` if the current profile role is `customer`.
5. Server writes application history.
6. User lands on pending status.

### Duplicate application behavior

- No seller profile: show application.
- Pending profile: route to pending status/settings; allow edits but do not duplicate.
- Approved profile: route to `/seller`.
- Rejected profile: show rejection reason and resubmission form.
- Suspended profile: show suspension reason/support guidance; no normal operations.

### Validation requirements

- Store name required and length-limited.
- Store slug required, URL-safe, unique, and editable only before approval.
- Store description required and length-limited.
- Support email required and email-shaped.
- Country required as `country_code`.
- Agreement checkbox required and stored as timestamp.
- Business email optional but validated if present.
- Phone optional but length/format bounded.

## 15. Admin seller review implementation plan

Admin review should move from simple inline status mutation to deliberate seller lifecycle decisions.

Plan:

- Keep `/admin/sellers` as the list route.
- Add `/admin/sellers/[id]` unless a single-page detail expansion can cleanly provide review depth.
- Load seller profile, owner profile, application fields, product count, order summary, email verification state, and status history.
- Approval:
  - Require admin role.
  - Require seller profile exists.
  - Require email verified.
  - Set `status = approved`, `approved_at`, `approved_by`.
  - Clear rejection/suspension reasons as appropriate.
  - Write `seller_status_history` and `admin_audit_logs`.
- Rejection:
  - Require safe seller-visible reason.
  - Set `status = rejected`.
  - Set `rejection_reason`.
  - Clear approval fields.
  - Write history and audit.
- Suspension:
  - Require safe seller-visible reason.
  - Set `status = suspended`.
  - Set `suspension_reason`.
  - Do not mutate product statuses automatically unless a future admin product policy requires it.
  - Rely on public visibility requiring seller approved so products hide immediately.
  - Write history and audit.
- Reactivation:
  - Require reason.
  - Require email verified.
  - Set `status = approved`, `approved_at`, `approved_by`.
  - Clear suspension/rejection reason if product owner wants clean active display, while preserving history.
  - Do not auto-activate archived or product-suspended products.
  - Write history and audit.
- Rejected resubmission:
  - Triggered from seller side, not admin side.
  - Sets `status = pending`, `resubmitted_at`, clears or preserves old rejection reason according to UI display decision, and writes history.

## 16. Seller dashboard implementation plan

Dashboard should answer "what needs my attention today?" for approved sellers and provide clear state guidance for non-approved sellers.

Repository/view-model requirements:

- `storeStatus`
- `storeName`
- `storeSlug`
- `totalProducts`
- `draftProducts`
- `activeProducts`
- `archivedProducts`
- `lowStockProducts`
- `ordersNeedingFulfillment`
- `recentOrders`
- `allTimeGrossSalesAmount`
- `last30DaysGrossSalesAmount`
- `currencyCode`

Metric definitions:

- Product counts are seller-scoped.
- Low stock counts limited-stock products with `stock_quantity > 0` and `stock_quantity <= low_stock_threshold`.
- Unlimited-stock products are excluded from low-stock counts.
- Orders needing fulfillment are based on seller-owned `order_items` in actionable states such as `unfulfilled` and `processing`.
- Recent orders are seller-scoped order summaries and must not include other sellers' line items.
- Gross sales are seller-owned paid line totals, not payout/net sales.
- Last-30-days sales should use order placed/created date consistently and be documented in code comments if the data source is ambiguous.

Status behavior:

- No seller profile: point to `/seller/register` from public/account entry points.
- Pending: show pending review and application details.
- Rejected: show safe rejection reason and resubmit path.
- Suspended: show safe suspension reason and support/admin guidance.
- Approved: show operational dashboard.

Store settings requirements:

- Store name editable when seller can edit profile.
- Store description editable when seller can edit profile.
- Support email and country required.
- Business email and phone optional.
- Slug editable only before approval.
- Approved slug input should be disabled or omitted with support/admin guidance.
- Suspended sellers should not be able to perform normal operations; profile edits should be limited to support-safe fields only if the implementation phase explicitly allows it.

## 17. Seller product/inventory implementation plan

Product operations remain approved-seller-only.

Create/draft:

- Approved seller can create a product.
- `seller_id` is always server-derived.
- Draft products can be saved without image.
- Draft validation can be more permissive than publish validation, but should still enforce bounded title/slug/price fields enough to avoid unusable data.

Publish:

- Seller status must be approved.
- Product must have valid title and slug.
- Product must have valid active category.
- Product must have valid price greater than zero.
- Product must have either thumbnail image or at least one gallery image.
- Limited-stock product can publish with zero stock if out-of-stock visible behavior is desired, but checkout/cart must prevent purchase.
- Unlimited-stock product does not require `stock_quantity`.

Edit:

- Seller can edit only own products.
- Seller cannot change `seller_id`.
- Seller cannot edit an admin-suspended product back to active.
- If an edit invalidates publish requirements, active save should fail or force draft according to implementation design. Prefer failing with a clear message for MVP.

Archive:

- Archive remains a soft remove from selling/history-preserving action.
- Archived products are not purchasable.
- Existing order item references remain intact.

Inventory:

- Limited stock: `is_unlimited_stock = false`, stock quantity integer `>= 0`.
- Unlimited stock: `is_unlimited_stock = true`, stock quantity null/ignored.
- Low stock threshold defaults to `5`.
- Low stock alert applies only to limited products above zero.
- Out-of-stock means limited product with `stock_quantity = 0`.
- Out-of-stock products stay visible if active but checkout/cart must block purchase.

Implementation caution:

- Product publish rules and checkout purchasability rules are related but not identical. Do not hide out-of-stock products by making product public visibility depend on stock.

## 18. Seller order/fulfillment implementation plan

Seller order work should preserve the current good foundation: seller order reads are derived from seller-owned `order_items`, not whole customer orders. The recovery work is about privacy, cancellation, and fulfillment granularity.

Order list:

- Load only orders with seller-owned `order_items`.
- Show order number, placed date, seller-owned item count, seller-owned quantity, seller-owned gross amount, and seller-owned fulfillment status summary.
- Do not show other sellers' line items.
- Emphasize orders needing action where seller-owned items are `unfulfilled` or `processing`.

Order detail:

- Load only seller-owned line items for the selected order.
- Do not expose other sellers' line items or totals.
- Do not expose customer email by default.
- Parse `orders.shipping_address_snapshot` into a safe seller fulfillment shape:
  - recipient name
  - address lines/city/region/postal/country as available
  - phone only if present and needed for shipment
- Never expose billing address, payment provider details, payment status mutation controls, or internal risk/admin notes.

Fulfillment updates:

- Seller can update own order items only.
- Seller cannot update payment status.
- Seller cannot update platform order status directly.
- Seller cannot update other sellers' items.
- Seller cannot cancel paid order items in MVP.
- Allowed seller transitions:
  - `unfulfilled` -> `processing`
  - `unfulfilled` -> `shipped`
  - `processing` -> `shipped`
  - `shipped` -> `delivered`
- Admin/platform retains `cancelled` for order item cancellation workflows outside seller MVP.

Tracking and shipment notes:

- Tracking code can be saved for shipped/delivered items.
- Shipment note can be saved for seller-owned items.
- Add length validation for shipment note.
- Preserve idempotency for repeated status submissions.

Granularity decision:

- Preferred implementation: seller updates selected owned `order_items` by item id.
- Acceptable MVP fallback: seller updates all of their owned items in an order only if the UI clearly presents the action as updating the seller's full shipment for that order.
- Do not allow a seller-supplied item id to bypass seller ownership checks.

## 19. Cleanup/removal plan

## 20. Testing and QA plan

## 21. Do-not-build-yet list

## 22. Recommended implementation order

## 23. Commit strategy for future implementation phases

## 24. Open blockers
