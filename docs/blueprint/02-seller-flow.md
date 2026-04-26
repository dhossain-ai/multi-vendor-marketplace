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
