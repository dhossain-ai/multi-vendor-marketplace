# Phase 4 — Seller Registration Implementation Note

## Route added

- Added `/seller/register` as the primary seller application route.
- `/sell` is now a lightweight public seller landing page that links into `/seller/register`.

## Application behavior

- Signed-out visitors are asked to create an account or sign in first, with `next=/seller/register`.
- Signed-in customers with no seller profile can submit a seller application.
- New seller applications create `seller_profiles` with `status = pending`.
- Pending sellers see an in-review state and cannot submit duplicate applications.
- Rejected sellers see the safe rejection reason and can edit/resubmit.
- Rejected resubmission sets `status = pending`, updates `resubmitted_at`, and clears the stale rejection reason.
- Suspended sellers see a suspension state and cannot resubmit.
- Approved sellers are redirected to `/seller`.

## Server-side safety

- Seller identity is derived from the authenticated session.
- Client input does not include or control `user_id`, `seller_id`, or seller status.
- Admin accounts are blocked from the seller application flow.
- Slug conflicts are handled as user-facing errors.
- Store slug changes are blocked after seller approval at the repository layer.
- Seller status history is written for new applications and rejected resubmissions when the server-side database client can write it.

## Phase 5 follow-ups

- Make lifecycle history and admin audit logging transactional or otherwise failure-visible.
- Add verified-email enforcement to admin approval.
- Add admin seller detail review with safe rejection/suspension reasons.
- Decide whether seller profile self-updates should use narrow RLS policies or continue through strict server actions.
