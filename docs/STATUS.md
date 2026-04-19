# Status

## Current Phase

Product detail and catalog foundation completed.

---

## Project State Summary

The repository now includes the first real marketplace product slice for public catalog browsing.
The homepage acts as a public catalog landing page, product detail pages resolve by slug, and catalog reads are routed through a dedicated repository/data-access layer.

---

## Completed

- Next.js 16 App Router application initialized in-repo
- TypeScript and Tailwind CSS v4 configured
- ESLint configured and Prettier added
- `src/` folder structure established for app, components, features, lib, styles, and types
- public catalog landing page built on the homepage
- product detail route implemented at `/products/[slug]`
- reusable product card and detail presentation components added
- catalog repository/data-access layer added for listing, slug lookup, related products, and public slug generation
- server-side public visibility filtering applied for listing and detail reads
- MVP-safe local catalog fallback dataset added for environments without live Supabase catalog data
- Supabase client scaffolding added for browser, server, and admin usage
- environment template created with Supabase-related setup variables
- README updated to reflect the live catalog foundation
- `STATUS.md`, `NEXT_STEPS.md`, and `DEV_SUMMARY.md` updated for the new baseline

---

## In Progress

- preparing the repository for auth and role integration
- keeping generated database types and live schema work aligned for future Supabase-backed features

---

## Not Started Yet

### Product / UX

- authentication and role enforcement
- cart UI/state and persistence
- checkout UI
- payment integration
- order persistence and lifecycle
- seller dashboard foundation
- admin dashboard foundation

### Backend / Business Logic

- role-aware auth integration
- customer/seller/admin access enforcement
- cart endpoints
- checkout endpoint
- coupon system
- review/wishlist system

---

## Known Gaps

- catalog uses an MVP-safe fallback dataset when live Supabase catalog data is unavailable
- placeholder database types still need to be replaced with generated schema types once schema work begins
- auth, cart, checkout, and dashboard behavior remain intentionally unimplemented
- public listing currently ships a simple default browse state without filters, sorting controls, or search UI

---

## Current Priority

Move from public catalog foundation into auth and role groundwork without weakening the catalog boundaries already in place.

---

## Immediate Focus

The next implementation focus should be:

- auth and role model
- cart and checkout foundation
- generated Supabase schema typing for repository-safe queries

---

## Risks

- letting public catalog logic leak into future protected seller/admin paths
- docs drifting away from code once implementation starts
- overcomplicating the catalog read path before auth/cart work begins
- delaying replacement of placeholder database types once schema-backed queries become more important

---

## Readiness Assessment

The project is ready to move into implementation once:

- Supabase project credentials are configured locally
- the next slice is limited to auth and role groundwork
- docs continue to be updated alongside implementation
