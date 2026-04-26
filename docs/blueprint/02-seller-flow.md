# Seller / Vendor Flow Blueprint

## 1. Purpose

This blueprint defines the seller/vendor lifecycle for the marketplace MVP. It is the source of truth for how a person applies to sell, how admins review that application, what sellers can do at each lifecycle state, and how seller-owned products, inventory, and fulfillment should behave in a multi-vendor order model.

The goal is to make the seller domain clear enough that later database, server action, UI, and test work can proceed without re-litigating core product rules. Existing code and migrations may already cover pieces of this flow, but this document describes the intended product behavior first.

## 2. Scope

In scope for seller MVP:

- Seller application and store profile creation.
- Admin review, approval, rejection, suspension, and reactivation.
- Seller dashboard status handling.
- Approved seller product management.
- Basic inventory rules for limited and unlimited stock.
- Seller-scoped order visibility and fulfillment updates.
- Security expectations for role, status, and ownership checks.
- Database and API impact previews, without final schema or implementation.

Out of scope details are listed at the end of this document and must not be pulled into the MVP seller flow unless the project owner explicitly expands scope.

## 3. Terminology Decision

Use `seller` internally in code, database, permissions, routes, and server operations. The canonical profile table should be `seller_profiles`; do not introduce `vendor_profiles`.

The customer-facing UI may use either `Seller` or `Vendor`, depending on brand tone. If the UI chooses `Vendor`, it is presentation copy only. Internal fields, table names, route ownership checks, logs, and code should continue to say `seller`.

Recommended language:

- Internal domain name: `seller`.
- Public CTA examples: `Become a Seller`, `Apply to Sell`, or `Become a Vendor`.
- Dashboard label: `Seller Dashboard` or `Vendor Dashboard`, chosen consistently by product copy.
- Database table: `seller_profiles`.
- Lifecycle enum: `seller_status`.
- Never mix `vendor_profiles` and `seller_profiles`.

## 4. Roles Involved

### Visitor

An unauthenticated person browsing the marketplace. A visitor may reach a public seller registration page, but must create or sign into an account before an application can be submitted.

### Customer/User Account

An authenticated marketplace account that can shop, place orders, and optionally apply to sell. A normal customer account has no seller profile until it submits an application.

### Seller/Vendor Applicant

An authenticated user with a seller profile in `pending` status. The applicant has submitted enough store/business information for admin review but cannot sell products or fulfill orders until approved.

### Approved Seller

An authenticated user with a seller profile in `approved` status. This user can manage their store profile, create and publish products, manage inventory, view seller-scoped orders, and update fulfillment for their own order items.

### Rejected Seller

An authenticated user with a seller profile in `rejected` status. This user cannot sell or fulfill orders. The UI should show the rejection state and, if the business allows resubmission, let the seller update application/store details for another review.

### Suspended Seller

An authenticated user with a seller profile in `suspended` status. This user previously had or could have had seller capabilities, but seller operations are currently paused by the marketplace. They cannot publish products, edit live inventory in a way that affects selling, or update fulfillment unless an explicit admin exception is later defined.

### Admin

An authenticated operator with marketplace administration rights. Admins review seller applications, change seller statuses, record reasons for decisions, and audit seller lifecycle changes.

## 5. Seller Lifecycle States

The seller lifecycle is profile-driven. A user either has no seller profile or exactly one seller profile.

### No Seller Profile

The user has an account but has not applied to sell. Seller routes may show an application CTA, but product, inventory, and fulfillment operations are unavailable.

### Pending

The user submitted a seller application and is waiting for admin review. The profile exists, the user may edit submitted store/application details if allowed by the UI, and seller operations remain locked.

Expected permissions:

- Can view application status.
- Can update non-operational store/application fields.
- Cannot create, publish, edit, or archive products.
- Cannot view seller orders.
- Cannot update fulfillment.

### Approved

The marketplace accepted the seller application. The seller can operate within seller-scoped permissions.

Expected permissions:

- Can view the approved seller dashboard.
- Can manage store profile/settings.
- Can create, draft, publish, edit, and archive own products.
- Can view own seller-scoped order items.
- Can update fulfillment for own order items only.

### Rejected

The marketplace declined the seller application. Rejection should preserve the submitted application for audit and support purposes.

Expected permissions:

- Can view rejection state and rejection reason when available.
- Can update application details only if the business allows resubmission.
- Cannot perform seller operations.
- Cannot create a second seller profile.

### Suspended

The marketplace paused the seller account. Suspension is an administrative state, not a deletion.

Expected permissions:

- Can view suspension state and suspension reason when available.
- Can view limited store/account information.
- Cannot publish new products.
- Cannot make live product/inventory changes that affect customer purchasing.
- Cannot update fulfillment unless the project owner later approves a specific exception for completing already-paid orders.

## 6. Separate Seller Onboarding Flows

### New Vendor Registration From Public Route

A public route such as `/sell`, `/vendors/apply`, or `/seller/register` may introduce the seller program and collect account/application details. Submission must result in an authenticated user account plus one pending seller profile.

Expected flow:

1. Visitor opens the public seller registration route.
2. Visitor provides account fields and seller application fields.
3. System creates or authenticates the user account.
4. System verifies the account is eligible to apply.
5. System creates `seller_profiles` row with `status = pending`.
6. User lands on a pending seller status screen.

If email verification is required by the auth provider, application submission may either:

- Create the user and hold the application until email verification completes.
- Create the pending seller profile immediately but keep all seller operations locked until email verification and admin approval are both complete.

The MVP should choose one behavior and express it clearly in UI copy. The safer default is to require a verified email before admin approval can be finalized.

### Existing Logged-In User Applying To Sell

An existing customer account may apply from an account page, seller CTA, or seller settings route.

Expected flow:

1. Authenticated customer opens the apply-to-sell flow.
2. System confirms the user is not an admin-only account and does not already have a seller profile.
3. User submits store/business/contact details.
4. System creates one seller profile with `status = pending`.
5. User sees the pending status and any next-step guidance.

The user may retain customer purchasing capabilities while waiting for seller review.

### Duplicate Application Behavior

One user account should have at most one seller profile.

Rules:

- If an account has no seller profile, allow application submission.
- If an account has a `pending` profile, do not create a duplicate; show the current pending status and allow edits if supported.
- If an account has an `approved` profile, route to the seller dashboard/settings instead of application.
- If an account has a `rejected` profile, do not create a duplicate; show rejection state and any resubmission path.
- If an account has a `suspended` profile, do not create a duplicate; show suspension state and contact/support guidance.
- Store slugs must be unique across all seller profiles, including rejected and suspended sellers, unless an admin explicitly releases a slug later.

## 7. Seller Registration/Application Fields

The seller application should be practical for marketplace review without becoming a heavy enterprise onboarding flow.

### Account Fields

Required when creating a new account through seller registration:

- Email address.
- Password or passwordless auth credential.
- Full name.

Optional for MVP:

- Phone number.
- Preferred contact method.

### Store Fields

Required:

- Store name.
- Store slug/public URL handle.
- Short store description or bio.

Recommended:

- Store logo image.
- Store support email if different from account email.

Validation expectations:

- Store name must be non-empty and reasonably bounded in length.
- Store slug must be URL-safe, unique, and normalized.
- Store description should allow enough text for review but prevent excessive content.
- Logo URL or upload reference must be validated as an allowed image source.

### Business/Contact Fields

Recommended for MVP review:

- Legal business name or individual seller name.
- Business type, such as individual, company, nonprofit, or other.
- Country/region.
- Contact name.
- Contact email.
- Contact phone.

Optional later fields:

- Business registration number.
- Tax/VAT ID.
- Business address.
- Return address.
- Support hours.
- Social/profile links.
- Product category interests.
- Expected monthly order volume.

### Agreement/Terms Checkbox

The application must include an explicit agreement checkbox. It should confirm that the applicant:

- Accepts marketplace seller terms.
- Confirms submitted information is accurate.
- Understands that approval is required before selling.
- Accepts marketplace moderation rights for products and seller status.

The checkbox must be required and stored as a timestamped acceptance record or equivalent auditable field.

## 8. Admin Review Flow

Admin review is the control point that turns an application into an operating seller account. The admin experience should support fast review while preserving enough detail to explain and audit decisions later.

### Pending Seller List

Admins need a seller review list with a default filter for `pending` applications.

Minimum list fields:

- Store name.
- Applicant name.
- Applicant email.
- Seller status.
- Submitted date.
- Last updated date.
- Product count, if products exist for the seller.
- Quick actions appropriate to the current status.

Useful filters:

- Status: pending, approved, rejected, suspended.
- Submitted date range.
- Store name or applicant email search.

### Seller Detail Review

Admins need a detail view or expanded row that shows:

- Account identity: user id, email, full name, account active state.
- Store information: name, slug, logo, description.
- Business/contact information submitted by the applicant.
- Terms acceptance evidence.
- Current seller status.
- Previous review, rejection, suspension, and reactivation history.
- Product and order summary once the seller has activity.

Admins should not need to inspect the database to understand why a seller is pending, rejected, suspended, or reactivated.

### Approve

Approving a seller changes `seller_profiles.status` to `approved`.

Expected side effects:

- Set `approved_at`.
- Set `approved_by` to the admin user id.
- Preserve original application fields.
- Record an audit/history entry with before and after status.
- Unlock approved-only seller operations.

Approval should not automatically publish products unless the product was already explicitly saved as active under a flow that allowed pre-approval product setup. For the MVP, the simpler rule is that pending sellers cannot create products, so approval only unlocks product creation.

### Reject With Reason

Rejecting a seller changes `seller_profiles.status` to `rejected` and requires a reason.

Expected side effects:

- Store the rejection reason in seller review history or an audit table.
- Clear approval fields if the profile was previously approved.
- Keep the seller profile row; do not delete the application.
- Keep the store slug reserved unless an admin release process is later added.
- Show the seller a clear rejected-state dashboard message.

The rejection reason may have an internal-only version and a seller-visible version. If only one reason field exists in MVP, treat it as admin-visible and write seller-facing copy separately to avoid accidentally exposing sensitive moderation notes.

### Suspend With Reason

Suspending a seller changes `seller_profiles.status` to `suspended` and requires a reason.

Expected side effects:

- Store the suspension reason in seller review history or audit logs.
- Keep the seller profile and product history.
- Prevent new seller operations that could affect customers.
- Hide or block suspended seller products from public purchase unless the project owner explicitly chooses a different policy.
- Preserve existing orders and seller-owned order item history.

Suspension is for marketplace risk control, policy violations, operational problems, or admin intervention. It is not the same as rejection because a suspended seller may already have products and orders.

### Reactivate

Reactivation moves a `suspended` or `rejected` seller back to `approved` when the marketplace allows the seller to operate again.

Expected side effects:

- Set `status = approved`.
- Set or update `approved_at`.
- Set `approved_by` to the reactivating admin.
- Record the reactivation reason and audit entry.
- Reopen approved-only operations.

Product visibility after reactivation should follow product status. Products that were independently archived or suspended should not become active just because the seller is reactivated.

### Audit/History Expectations

Every admin seller lifecycle decision must produce an auditable record.

Minimum audit fields:

- Actor admin user id.
- Seller profile id.
- Previous status.
- New status.
- Reason.
- Timestamp.
- Before/after snapshots or structured metadata when practical.

Audit history should be append-only from the application perspective. If a reason must be corrected, record a new correction entry instead of editing history silently.

### Recommended Status Transitions

Allowed transitions for MVP:

- `pending` -> `approved`
- `pending` -> `rejected`
- `pending` -> `suspended`
- `approved` -> `suspended`
- `rejected` -> `approved`
- `rejected` -> `suspended`
- `suspended` -> `approved`
- `suspended` -> `rejected`

Disallowed by default:

- Creating another profile to restart review.
- Deleting seller profiles as a normal moderation action.
- Moving a seller to `pending` after initial submission unless a formal resubmission state is added later.

## 9. Seller Dashboard Behavior By Status

Seller routes should be status-aware. The UI can be welcoming, but server behavior must enforce permissions independently of UI state.

### No Profile

Show an apply-to-sell entry state.

Expected behavior:

- Explain that seller setup is required.
- Link to the seller application/store setup form.
- Do not show product, inventory, or order tools.
- Server operations should reject seller actions because no seller profile id exists.

### Pending

Show application-in-review state.

Expected behavior:

- Display current status as pending review.
- Confirm that the application was submitted.
- Allow store/application detail edits if the MVP supports edits during review.
- Keep product, inventory, and order operations locked.
- Avoid implying a guaranteed approval timeline.

### Rejected

Show not-approved state.

Expected behavior:

- Display current status as rejected.
- Show seller-visible reason or generic guidance if no seller-visible reason exists.
- Offer update/resubmission path only if the business allows it.
- Keep seller operations locked.
- Do not invite the user to create a new application with the same account.

### Suspended

Show suspended state.

Expected behavior:

- Display current status as suspended.
- Show seller-visible reason or support guidance if available.
- Lock product publishing, inventory updates, and fulfillment updates.
- Preserve access to basic profile/status information.
- Avoid exposing internal moderation notes.

### Approved

Show the operating seller dashboard.

Expected behavior:

- Display store status and operational summary.
- Provide quick access to products, orders, and store settings.
- Show counts and alerts that help the seller act.
- Use only server-derived seller identity for all data.

## 10. Approved Seller Dashboard Requirements

The approved seller dashboard should be operational, not decorative. It should help a seller answer: "What needs my attention today?"

Minimum dashboard data:

- Store name.
- Store slug/public storefront link when available.
- Seller status.
- Total product count.
- Draft product count.
- Active product count.
- Archived product count.
- Low stock product count.
- Orders needing fulfillment.
- Recent seller-scoped orders.
- Gross sales summary.
- Quick actions.

### Store Status

Show the seller's current status, store name, and whether the store is eligible for public sales. If product visibility depends on seller approval and product/category status, communicate that through clear operational states.

### Product Counts

Product counts must be seller-scoped.

Required counts:

- Total products.
- Draft products.
- Active products.
- Archived products.

Optional later counts:

- Suspended products.
- Products missing images.
- Products missing category.
- Products blocked by inactive category.

### Low Stock Count

Low stock should count limited-stock products at or below the configured low-stock threshold and above zero. Unlimited-stock products should not appear in low-stock counts.

### Orders Needing Fulfillment

Orders needing fulfillment should be calculated from seller-owned order items, not whole orders. A multi-vendor order may need action from one seller while another seller's items are already shipped.

Count items or grouped orders where the seller has at least one item in an actionable fulfillment state, such as:

- `unfulfilled`
- `processing`

### Recent Orders

Recent orders should show seller-relevant order summaries only:

- Order number.
- Placed date.
- Seller-owned item count and quantity.
- Seller-owned gross sales amount.
- Fulfillment status summary for seller-owned items.
- Link to seller order detail.

Do not show other sellers' items in the seller dashboard.

### Gross Sales Summary

Gross sales should use seller-owned line totals before payouts, fees, refunds, or chargebacks unless a later finance module defines net sales. The MVP dashboard should label this clearly as gross sales.

Recommended periods:

- Today or last 24 hours.
- Last 7 days.
- Last 30 days.
- All time.

If only one number is available in MVP, use all-time gross sales and label it as such.

### Quick Actions

Recommended quick actions for approved sellers:

- Create product.
- View products.
- View orders.
- Edit store settings.

Do not show actions that are locked by status. If the seller becomes suspended while viewing the dashboard, server actions must still reject locked operations.

## 11. Store Profile/Settings Flow

The store profile is the seller's public and administrative identity. Sellers should be able to keep it accurate without affecting their lifecycle status unless a future review policy requires re-approval for major changes.

Seller-editable MVP fields:

- Store name.
- Store slug, if slug changes are allowed.
- Store description/bio.
- Logo image.
- Support/contact email, if collected.
- Business/contact fields used for review, if collected.

Rules:

- Only the owner of the seller profile or an admin can edit it.
- Store slug must remain unique and URL-safe.
- Editing store fields should not bypass rejection or suspension.
- Editing store fields should not automatically approve or reactivate a seller.
- Store profile updates should record `updated_at`.
- Major changes may be logged for admin visibility.

Recommended behavior by status:

- No profile: show application form.
- Pending: allow edits to improve review details.
- Approved: allow store settings edits.
- Rejected: allow edits only if resubmission is supported.
- Suspended: allow read-only or limited edits based on business policy.

Customer-facing storefront visibility should require at least:

- Seller is approved.
- Store profile has required public fields.
- Store is not manually hidden by admin.

## 12. Product Management Flow

Product management is approved-seller-only for MVP. Pending, rejected, suspended, and no-profile users must not be able to create or modify sellable products.

### Create Product

An approved seller can create a product owned by their seller profile.

Required product fields:

- Product title.
- Slug or generated URL handle.
- Description or short description.
- Category.
- Price.
- Currency.
- Inventory mode.
- Product status: draft or active.

Recommended product fields:

- Thumbnail image.
- Gallery images.
- SKU.
- Low-stock threshold.
- Basic product metadata.

Creation rules:

- `seller_id` must come from the authenticated session's seller profile, not from client input.
- Seller must be approved at write time.
- Category must exist and be active if the product is published.
- Price must be non-negative and use a supported currency.
- Product slug must be unique within the expected product URL strategy.

### Save Draft

Draft is the safe default for incomplete product work.

Draft rules:

- Draft products are visible to the seller and admins only.
- Draft products are not purchasable.
- Draft products may have incomplete public-selling fields, within validation limits.
- Draft products still belong to exactly one seller.

### Publish

Publishing makes a product eligible for public catalog visibility, subject to all visibility rules.

Publish requirements:

- Seller status is `approved`.
- Product status is changed to `active`.
- Required product content is complete.
- Category is selected and active.
- Price is valid.
- Inventory is valid and sellable, unless unlimited stock is enabled.
- Product has required image(s), if the marketplace requires images for public listings.

Public visibility should require seller approval, product active status, and category availability. A product should not be publicly visible just because its own status is active.

### Edit

Approved sellers can edit their own products.

Rules:

- Ownership must be checked on every edit.
- Sellers cannot change `seller_id`.
- Editing an active product should immediately affect future browsing/purchasing unless a later moderation workflow is added.
- If an edit makes an active product invalid for sale, the system should block the save or force the product back to draft.

### Archive

Archiving removes a product from active selling without deleting history.

Rules:

- Archived products are not publicly purchasable.
- Archived products remain visible to seller/admin history.
- Existing order items continue to reference their purchased product snapshot or product id.
- Sellers can usually restore archived products to draft or active if all publish requirements are met.

Hard deletion is not part of seller MVP because products may be referenced by orders, carts, audit logs, or analytics.

### Images

Images should support:

- One thumbnail/primary image.
- Optional gallery images.
- Alt text where practical.
- Stable sort order.

Validation expectations:

- Accept only allowed image storage sources or uploaded assets.
- Prevent arbitrary untrusted URLs if the platform uses managed storage.
- Limit image count and size.
- Do not let image updates bypass product ownership checks.

### Category Selection

Sellers should choose from active marketplace categories.

Rules:

- A product can be saved as draft without category only if draft validation allows it.
- A product cannot be published without an active category.
- If an admin deactivates a category, affected active products should no longer be publicly purchasable until moved to an active category.

### Price

Price rules:

- Store price in minor units or a precise decimal strategy; do not rely on floating-point math for money.
- Currency must be explicit.
- Active products must have a price greater than zero unless the marketplace explicitly supports free products.
- Seller cannot change payment status, payouts, or order totals by editing product price after purchase.
- Order items must preserve the purchased unit price at checkout time.

### Inventory

Inventory is part of the product's sellability state.

Rules:

- Product must choose limited or unlimited stock.
- Limited-stock products require a non-negative stock quantity.
- Unlimited-stock products should not require a stock quantity.
- Publishing should be blocked for limited-stock products with zero stock unless the marketplace allows visible out-of-stock listings.
- Checkout must validate stock server-side before creating order items.

## 13. Inventory Rules

Inventory rules should be simple and predictable for MVP.

### Limited Stock

Limited stock means the seller has a finite quantity available.

Rules:

- `is_unlimited_stock = false`.
- `stock_quantity` is required.
- `stock_quantity` must be an integer greater than or equal to zero.
- Checkout reserves or decrements stock using a server-side, concurrency-safe operation.
- Sellers cannot set negative stock.

### Unlimited Stock

Unlimited stock means the product can be sold without stock depletion.

Rules:

- `is_unlimited_stock = true`.
- `stock_quantity` should be null or ignored.
- Product is not low stock or out of stock due to quantity.
- Useful for digital goods, made-to-order products, or services only if the marketplace allows those categories.

### Low Stock

Low stock is an alert state for limited-stock products.

Default MVP rule:

- A product is low stock when `is_unlimited_stock = false`, `stock_quantity > 0`, and `stock_quantity <= low_stock_threshold`.

If no per-product threshold exists, use a marketplace default such as 5 units.

### Out Of Stock

Out of stock applies to limited-stock products with zero available quantity.

Rules:

- Product cannot be purchased when out of stock.
- Product may remain visible as out of stock if the project owner wants demand capture.
- Product should be excluded from "active sellable" counts if active sellable means purchasable now.

### Stock Validation Expectations

Stock must be validated in server-side operations, not only in the UI.

Validation must occur when:

- Creating or updating a product.
- Publishing a product.
- Adding to cart, if cart stock validation is supported.
- Checking out.
- Admins modify inventory.

Checkout is the final authority. If stock changed between cart and checkout, checkout should fail gracefully or adjust according to the cart/checkout blueprint.

## 14. Seller Order Flow

Seller orders are derived from order items owned by the seller. In a multi-vendor marketplace, the order is customer-facing and platform-level; the seller's operational unit is their subset of order items.

### Seller-Scoped Order List

An approved seller can view orders containing at least one item with `order_items.seller_id` equal to their seller profile id.

List fields:

- Order id and order number.
- Placed date.
- Seller-owned item count.
- Seller-owned quantity.
- Seller-owned gross total.
- Seller-owned fulfillment status summary.
- Customer name, if allowed by privacy policy.
- Destination region or shipping summary, if needed for fulfillment.

The list must not include orders where the seller has no items.

### Seller Order Detail

Seller order detail should show only the seller-relevant slice of the order.

Seller-visible fields:

- Order number.
- Order placed date.
- Seller-owned line items.
- Product title/sku snapshot.
- Quantity.
- Unit price at purchase.
- Line total.
- Fulfillment status for each seller-owned item.
- Tracking code and shipment note for seller-owned fulfillment.
- Customer shipping name and address fields required to fulfill the seller's items.
- Customer email or phone only if needed for fulfillment/support and allowed by policy.

Seller-hidden fields:

- Other sellers' line items.
- Other sellers' fulfillment details.
- Platform payment processor details.
- Payment status update controls.
- Internal fraud/risk notes.
- Admin-only customer account details.

### Own Line Items Only

Every seller order query must filter by server-derived seller profile id. Client-supplied seller ids are not trusted.

Rules:

- Seller can read only order items owned by their seller profile.
- Seller can update fulfillment only for order items owned by their seller profile.
- Seller cannot infer other sellers' products, quantities, totals, or fulfillment states from the response.

### Customer/Shipping Info Visibility

Sellers need enough shipping data to fulfill physical goods, but no more than necessary.

MVP visibility:

- Shipping recipient name.
- Shipping address.
- Shipping phone only if carrier/shipping workflow needs it.
- Customer email only if seller support workflow needs direct communication.

Do not expose billing details, payment method details, or unrelated customer profile data to sellers.

### Fulfillment States

Recommended item-level fulfillment states:

- `unfulfilled`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

Seller-allowed updates for MVP:

- `unfulfilled` -> `processing`
- `unfulfilled` -> `shipped`
- `processing` -> `shipped`
- `shipped` -> `delivered`

Admin-only or restricted updates:

- Any transition to `cancelled`, unless the project owner explicitly allows seller cancellation.
- Backward transitions such as `delivered` -> `processing`.
- Payment-related changes.

### Tracking Code

When marking an item shipped, the seller should be able to provide a tracking code.

Rules:

- Tracking code is optional only if the marketplace supports non-tracked shipping.
- Tracking code must be stored on seller-owned order item fulfillment data.
- Tracking code changes must be owner-checked and auditable enough for support.

### Shipment Note

Shipment note lets the seller provide carrier, handoff, pickup, or delivery context.

Rules:

- Shipment note is seller-editable only for seller-owned order items.
- Notes should be bounded in length.
- Notes should not contain internal admin-only data.

## 15. Fulfillment Rules

Fulfillment belongs to order items in multi-vendor orders. A single customer order can contain items from multiple sellers, and each seller may fulfill at a different time.

Core rules:

- `orders` represent the customer's platform-level purchase.
- `order_items` represent seller-owned fulfillment units.
- Seller fulfillment updates apply to the seller's own order items only.
- Seller cannot update platform payment status.
- Seller cannot update platform order status directly.
- Seller cannot update other sellers' order items.
- Platform/admin logic may derive whole-order status from item-level fulfillment states.

Whole-order examples:

- If all non-cancelled items are delivered, the platform may mark the order complete.
- If one seller ships and another is still processing, the customer order is partially fulfilled.
- If an item is cancelled by admin, order totals/refunds require a separate refunds/payments flow outside seller MVP.

Seller fulfillment actions must be idempotent where possible. Re-submitting the same tracking code/status should not corrupt order state.
