# Phase 5: Admin Seller Review and Status History

## Summary
In this phase, we completed the admin review workflow for seller applications. This ensures that the marketplace maintains strict control over which sellers can operate and handles status transitions with transparent record-keeping and robust gatekeeping.

## Key Deliverables
1. **Admin Seller Detail Page**: Created `/admin/sellers/[id]` as a comprehensive view of a seller's identity, contact information, acceptance status, and history.
2. **Verified-Email Gating**: The approval action `updateSellerStatusAction` now uses the Supabase Admin client to verify that the target user has a confirmed email address (`email_confirmed_at`) before allowing the transition to `approved`.
3. **Mandatory Reasons for Rejection/Suspension**: Added a mandatory `reason` text area in the detail UI. The server action enforces this requirement for both `rejected` and `suspended` statuses, saving the reason in the respective `rejection_reason` or `suspension_reason` columns.
4. **Lifecycle Audit Logging**: All seller status updates are now written to `seller_status_history` in addition to `admin_audit_logs`, tracking the `previous_status`, `new_status`, the admin who changed it (`changed_by`), and any `reason` provided.

## Affected Files
- `src/features/admin/types.ts`: Extended `AdminSeller` and added `AdminSellerDetail`, `AdminSellerHistoryEvent`.
- `src/features/admin/lib/admin-seller-repository.ts`: Added `getAdminSellerById` to fetch full details including history and Supabase Auth email status. Updated `updateSellerStatus` to perform required checks and writes.
- `src/features/admin/lib/admin-actions.ts`: Updated `updateSellerStatusAction` to accept a `reason` and `returnTo` URL.
- `src/features/admin/components/admin-seller-detail-view.tsx` [NEW]: Interactive UI for reviewing the seller and taking moderation actions.
- `src/features/admin/components/admin-sellers-view.tsx`: Updated list view to link to the new detail page.
- `src/app/admin/sellers/[id]/page.tsx` [NEW]: New app router page for viewing a seller's detail.

## Data Consistency Rules
- Moving to `approved` clears any existing `rejection_reason` or `suspension_reason`.
- Moving to `rejected` requires a reason, clears `suspension_reason`, and sets `rejection_reason`.
- Moving to `suspended` requires a reason and sets `suspension_reason`.
- `seller_status_history` keeps the permanent timeline, whereas `seller_profiles` shows the active reason context.

## Next Steps
With the seller onboarding and admin review logic complete, the foundational marketplace rules for sellers are ready. Future phases will focus on extending product management capabilities, seller dashboard analytics, and the checkout workflow for buyers purchasing from verified sellers.
