# Phase 6: Seller Dashboard and Store Settings Cleanup

## Summary
In this phase, we brought the seller dashboard and settings views into alignment with the marketplace blueprint. Sellers now see targeted messaging based on their approval status, cannot change restricted fields (like the slug after approval), and can monitor real sales metrics via their dashboard.

## Dashboard Status Behavior
We enforced strict routing and view states for sellers depending on their application status:
- **No Profile**: Directly routed to `/seller/register` to submit their store application.
- **Pending**: Sees "Application under review" messaging with no operational links.
- **Rejected**: Sees the exact `rejectionReason` with a prompt to resubmit.
- **Suspended**: Sees the exact `suspensionReason` with store settings and operational views blocked.
- **Approved**: Has full access to the dashboard, including Products and Orders, with active metrics.

## Dashboard Metrics
Approved sellers now see a complete set of MVP-realistic metrics scoped strictly to their store:
- **Listings**: Total, active, draft, archived.
- **Live Listings**: Shows active products and flags `lowStockProducts` (<= 5).
- **Orders to Fulfill**: Count of `unfulfilledOrders` alongside total sold items.
- **Gross Sales**: Displays both 30-day and all-time `grossSalesAmount` calculated from paid order items.

## Store Settings Behavior
- We expanded the `SellerStoreProfileFormData` to formally include `supportEmail`, `countryCode`, `businessEmail`, and `phone`.
- The slug is read-only after a seller is approved to preserve permalink stability.
- Suspended sellers are entirely blocked from submitting store settings updates.

## Next Steps
- Implement full payout and commission logic.
- Introduce advanced inventory rules (like shipping zones).
- Refine order fulfillment UI and lifecycle notifications.
