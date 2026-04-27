# Phase 9 — Seller Flow QA, Security, and Cleanup

## 1. Purpose
To perform a comprehensive end-to-end audit, quality assurance pass, and security hardening of the seller/vendor flow implemented across Phases 4 through 8, ensuring the marketplace is robust and client-ready.

## 2. Scope
- Seller registration and onboarding lifecycle (`/seller/register`).
- Admin seller review and status management (`/admin/sellers`).
- Seller store profile and settings (`/seller/settings`).
- Seller product management and inventory rules (`/seller/products`).
- Seller order privacy and fulfillment transitions (`/seller/orders`).
- Server-side access controls and identity validation.

## 3. Automated checks
- `npm run lint` completed successfully with 0 warnings.
- `npm run typecheck` completed successfully with 0 errors.
- `npm run build` completed successfully with 0 emit errors.

## 4. Manual QA checklist
- [x] Profile lifecycle states (Pending, Approved, Rejected, Suspended)
- [x] Identity verification vs. UI state
- [x] Product status logic and boundaries
- [x] Order visibility and transition logic

## 5. Route guard review
- `/seller` page and sub-routes are successfully protected by `requireSellerRole`.
- Individual dashboard features (`/seller/products`, `/seller/orders`) are gated strictly by `requireApprovedSeller` and `SellerStatusGate`.
- Admin routes (`/admin`) are globally protected in `src/app/admin/layout.tsx`. Admin actions are protected by `requireAdminRole`.

## 6. Seller status matrix
- `pending`: can view UI, cannot access dashboard or operations.
- `approved`: full access to products, orders, and settings. Slug is locked.
- `rejected`: sees rejection reason, can resubmit application via `/seller/register`.
- `suspended`: locked out of dashboard and settings, public products hidden, suspended items cannot be updated or archived by the seller.

## 7. Ownership/security review
- `seller_id` is successfully derived purely from `session.sellerProfile?.id` across all seller-facing repositories. No client-side parameter tampering is possible.
- Admin status transitions correctly use `session.user.id` for logging/audit events.

## 8. Product/inventory review
- Unlimited stock, low stock thresholds, and stock bounds (< 0 check) verified in `validateProductForm`.
- Active products mandate `categoryId` and `thumbnailUrl`/`galleryImageUrls`.

## 9. Order/privacy/fulfillment review
- `order_items` are tightly joined on `seller_id`.
- Sellers cannot view other sellers' order details or gross totals on a given order.
- `customerEmail` is actively removed from `SellerOrderDetail`.
- `trackingCode` and `shipmentNote` have correct max length truncation/validation.

## 10. Bugs found
- *Security/Edge Case*: Suspended sellers were theoretically able to edit their store settings (e.g. bio, name) through `/seller/settings` because the mutation `updateSellerProfile` lacked a status check for suspensions.

## 11. Fixes applied
- Hardened `updateSellerProfile` in `seller-profile-repository.ts` to explicitly throw a `SellerProfileError` if a suspended seller attempts to edit their profile settings.

## 12. Remaining risks
- Transactional notification emails for order and application status transitions are still pending.
- Admin refunds/cancellation interface must be built in future phases to handle the fact that sellers are no longer permitted to cancel orders.
- Payout infrastructure needs to be connected to Stripe Connect so sellers can receive funds.

## 13. Recommended next phase
- **Phase 10**: Admin Refund & Order Operations Tooling. This will give admins the necessary tools to manage order exceptions that we stripped from the sellers in Phase 8.
