# Auth and Roles

## Purpose

This document defines how authentication, authorization, role handling, and ownership boundaries should work in the marketplace platform.

It answers:

- who can access the system
- what each role can do
- how protected routes should work
- how seller approval should work
- where access checks must be enforced

This file focuses on access control and identity behavior. It should stay aligned with `FEATURE_SPEC.md`, `DATABASE_SCHEMA.md`, and `API_SPEC.md`.

---

## Goals

### Primary Goals

- provide a clear and scalable role model
- enforce server-side authorization
- separate customer, seller, and admin capabilities
- protect ownership boundaries
- keep the system simple enough for MVP while preserving future upgrade paths

### Non-Goals

At this stage, the auth model does not aim to support:

- complex multi-tenant org structures
- delegated admin hierarchies
- granular permission builders
- full enterprise IAM models

The current model is role-based, with ownership enforcement and a small set of platform-level permissions.

---

## Authentication Model

## Auth Source

Authentication should be handled through Supabase Auth.

Expected capabilities:

- sign up
- sign in
- sign out
- session retrieval
- protected server-side session checks

## Identity Source of Truth

The authentication provider confirms identity.
The application database stores:

- profile information
- role information
- seller status
- platform-specific user state

### Important Rule

A valid session proves identity, but does **not** automatically grant access to seller or admin features.

---

## User Model

## Base User

Every authenticated user is represented in the application as a profile record.

Recommended core profile fields:

- `id`
- `email`
- `full_name`
- `role`
- `is_active`
- `created_at`
- `updated_at`

## Roles

Initial roles:

- `customer`
- `seller`
- `admin`

Optional future roles:

- `support`
- `super_admin`

---

## Role Definitions

## Customer

Default user role.

A customer can:

- browse products
- manage cart
- apply coupons
- complete checkout
- view own orders
- manage own addresses
- manage wishlist
- leave reviews if eligible

A customer cannot:

- access seller dashboard
- manage products
- view seller analytics
- access admin features

---

## Seller

A seller is a user allowed to operate marketplace inventory under a seller profile.

A seller can:

- manage their own seller profile
- create and update their own products
- archive their own products
- view seller-scoped order data
- view sales and earnings summaries

A seller cannot:

- access other sellers' data
- access admin controls
- bypass seller approval requirements
- change platform-wide settings

### Important Note

Seller role and seller approval status are related, but not identical.
A user may have seller intent or seller role while still being restricted by approval status.

---

## Admin

An admin is a platform operator with elevated operational access.

An admin can:

- view admin dashboard
- approve or reject sellers
- suspend sellers
- moderate products
- manage categories
- manage coupons
- monitor platform orders
- review platform metrics

An admin must not:

- bypass auditability for sensitive actions
- recalculate historical orders incorrectly
- modify seller/customer data without proper business rules

---

## Seller Approval Model

## Seller Statuses

Recommended values:

- `pending`
- `approved`
- `rejected`
- `suspended`

## Meaning of Statuses

- `pending`: seller application exists but is not active
- `approved`: seller can use seller features
- `rejected`: seller application was denied
- `suspended`: seller access is restricted due to operational or policy reasons

## Rules

- only approved sellers can fully access seller dashboard operations
- suspended sellers must not create or edit active products
- seller suspension must not break historical orders
- rejected sellers may be allowed to reapply depending on product policy

---

## Role vs Status Separation

## Why This Matters

Role answers:

- what kind of platform user this is

Status answers:

- whether the seller is currently allowed to act

### Example

A user may have:

- role = `seller`
- seller_status = `pending`

This means:

- they are part of the seller flow
- but they do not yet have full seller permissions

This separation keeps the system clearer and easier to evolve.

---

## Access Control Model

## Principle

Access must be enforced in layers:

1. authentication check
2. role check
3. ownership check
4. business-state check

### Example

To update a seller product, the system should verify:

1. user is signed in
2. user has seller role
3. seller is approved and active
4. product belongs to that seller
5. product state allows update

Frontend visibility alone is not enough.

---

## Protected Route Categories

## Public Routes

No authentication required.

Examples:

- home page
- product listing
- product detail
- search suggestions
- public seller profile if supported later

## Authenticated Customer Routes

Require signed-in user.

Examples:

- cart
- checkout
- order history
- account profile
- addresses
- wishlist
- reviews

## Seller Routes

Require:

- signed-in user
- seller role
- valid seller profile
- approved seller status unless explicitly allowed otherwise

Examples:

- seller dashboard
- seller products
- seller orders
- seller earnings summary

## Admin Routes

Require:

- signed-in user
- admin role

Examples:

- admin dashboard
- seller moderation
- product moderation
- coupon/category management
- platform order monitoring

---

## Ownership Rules

## Customer Ownership

A customer can only access:

- their own profile
- their own addresses
- their own cart
- their own orders
- their own wishlist
- their own review creation rights

## Seller Ownership

A seller can only access:

- their own seller profile
- their own products
- their own seller-scoped order items or summaries
- their own commission or payout views if implemented later

## Admin Access

Admin access is broader, but should still be intentional and auditable.

---

## Route Protection Strategy

## UI Layer

The UI may hide links or routes based on role, but this is only for user experience.

UI restrictions are not security boundaries.

## Server Layer

The server must enforce:

- session existence
- role eligibility
- seller approval state
- ownership of the resource
- business rules tied to resource state

### Rule

If a route performs a write or exposes sensitive data, protection must exist server-side.

---

## Recommended Enforcement Flow

## Generic Protected Request Flow

1. read session/user
2. ensure user exists and is active
3. load profile
4. verify role
5. verify seller status if seller operation
6. verify resource ownership if resource-scoped
7. apply business rules
8. execute action

This sequence should be consistent across protected endpoints.

---

## Supabase / RLS Guidance

## Role of RLS

If Supabase Row Level Security is used, it should help reinforce ownership boundaries.

Examples:

- customer can only read own cart
- seller can only read own products
- seller can only read own seller profile

## Important Rule

RLS is helpful, but business correctness must still be explicit in server-side logic.

Do not rely on RLS alone for:

- checkout validation
- role transition logic
- admin moderation rules
- seller approval logic
- payment/order transitions

---

## Session Handling

## Session Source

Server-side session retrieval should be used for protected operations.

## Session Expectations

A valid session should provide enough information to identify:

- authenticated user id
- auth state

The application should load platform-specific role and status information from the database rather than trusting only session metadata.

---

## Inactive or Disabled Users

## Rules

If a user is marked inactive:

- protected operations should be blocked
- checkout should be blocked
- seller/admin operations should be blocked

Historical data must remain intact even if a user later becomes inactive.

---

## Admin Safety Rules

## Principles

- admin actions should be deliberate
- sensitive admin changes should be audit logged
- admin changes must not corrupt historical order data
- admin should not silently rewrite commerce history

Examples of actions that should be auditable:

- seller approval/rejection/suspension
- product suspension
- coupon creation/update/deactivation
- manual order status changes

---

## Edge Cases

## Authentication Edge Cases

Plan for:

- expired session during checkout
- missing profile for authenticated user
- duplicate signup handling
- auth provider returns valid user but app profile is inactive

## Seller Edge Cases

Plan for:

- seller role exists but seller profile missing
- seller profile exists but status is pending
- seller is suspended while logged in
- seller tries to access another seller's product

## Admin Edge Cases

Plan for:

- admin attempting invalid status transition
- admin modifying resources with historical dependencies
- admin and seller editing same product concurrently

---

## Access Error Rules

## Recommended Responses

- `401` when not authenticated
- `403` when authenticated but not allowed
- `404` when resource should not be disclosed or does not exist
- `409` when action conflicts with current business state

### Examples

- seller trying to edit another seller's product → `404` or `403` depending on disclosure policy
- pending seller opening seller product create route → `403`
- inactive user initiating checkout → `403`

---

## Audit and Observability

Important auth/role-sensitive operations should be traceable.

Recommended logging or audit coverage:

- seller approval/rejection/suspension
- admin-only mutations
- permission-denied events where useful
- suspicious repeated access attempts if later needed

---

## Future Expansion Notes

This model is intentionally simple first.

Possible future expansions:

- support role
- super admin role
- permission matrix for admin tooling
- organization/team-based seller access
- delegated seller staff accounts

These are not required for MVP.

---

## Architectural Decisions to Preserve

The following decisions should remain true unless intentionally changed:

1. authentication and authorization are separate concerns
2. role checks must be server-side
3. seller approval status is separate from seller role
4. ownership checks are mandatory for seller/customer scoped data
5. admin access is explicit and operationally sensitive
6. historical orders must survive role/status changes

---

## Related Documents

- `PROJECT_OVERVIEW.md`
- `FEATURE_SPEC.md`
- `DATABASE_SCHEMA.md`
- `API_SPEC.md`
- `architecture/ARCHITECTURE_OVERVIEW.md`

---

## Summary

The auth model should stay simple, clear, and strict:

- identity comes from auth
- roles come from the application
- seller permission depends on approval state
- ownership is enforced server-side
- admin actions are controlled and auditable
