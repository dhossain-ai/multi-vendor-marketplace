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
