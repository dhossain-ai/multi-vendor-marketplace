# Phase 17B - Product Discovery UI Audit

## 1. Purpose

Audit the product discovery surfaces before the Phase 17B deep polish pass. This phase focuses on `/products`, product cards, product visuals, no-results recovery, and `/products/[slug]` presentation while preserving marketplace business rules.

## 2. Scope

Reviewed and scoped changes to public catalog presentation:

- `src/app/products/page.tsx`
- `src/app/products/[slug]/`
- `src/features/catalog/components/`
- `src/features/catalog/components/cards/`
- `src/features/catalog/components/detail/`
- `src/features/catalog/components/product-visual.tsx`
- `src/features/catalog/lib/catalog-repository.ts` for visibility verification only

Checkout, payments, seller/admin logic, schema, and migrations were intentionally excluded.

## 3. Pages/components reviewed

- Product listing page
- Product card and grid components
- Product visual/fallback component
- Catalog empty state
- Product detail view
- Product detail route and loading/not-found states
- Public catalog repository query filters
- Add-to-cart form boundary

## 4. Product listing issues

- The listing page works and already has search/category/sort/pagination, but the browse hierarchy can feel flat.
- Search and sort are present, yet the page does not clearly separate "search intent" from "browse departments" and "current results."
- Product count exists but could be more useful by showing range, current page, and selected browse context.
- Pagination is functional but visually disconnected from the product grid.

## 5. Product card issues

- Product cards include the required commerce fields, but the visual hierarchy can still feel basic.
- Price needs stronger placement and scanning weight.
- Seller/category metadata needs clearer structure without looking like internal admin data.
- Availability is present, but purchasable and out-of-stock states can be more visually distinct.
- Focus states should be clearer for keyboard users.
- Mobile spacing can be tightened so cards feel deliberate rather than tall by accident.

## 6. Product detail issues

- Product detail has the right data, but it needs a stronger product-page rhythm: image/gallery, title, price, seller, availability, add-to-cart, description, and related products.
- The seller/store information should feel like a commerce trust block.
- The add-to-cart area should communicate purchasability and login/server-protected behavior without changing the action.
- Product detail metadata should be clearer without adding fake specs.

## 7. Search/filter/sort UX issues

- Query behavior is correct, but the search toolbar needs stronger labels and recovery affordances.
- Category chips wrap, but they should be framed as departments and remain tap-friendly.
- Active filters should be easier to scan and clear.
- Sort should stay simple and limited to already supported values.

## 8. Empty/no-result state issues

- The shared empty state is safe but generic.
- No-results cases should offer clear shopper recovery paths: clear filters, browse all products, browse departments, and return home.
- Copy should encourage alternate searches and spelling checks without using developer language.

## 9. Responsive/mobile issues

- Mobile layout works, but search/sort controls, chips, product cards, and detail CTAs need stronger stacked spacing.
- Product cards should remain readable and tappable without horizontal scroll.
- Product detail should prioritize the image, price, availability, and add-to-cart controls on small screens.

## 10. Product visibility findings

Public catalog repository queries continue to enforce visibility server-side:

- seller is approved
- product is active
- category is active/valid
- product passes existing publish requirements
- product is not suspended, archived, or draft

Phase 17B must not weaken these rules to make browsing pages look fuller.

## 11. Fixes applied

To be completed after implementation:

- Product listing hierarchy, toolbar, active filters, pagination, and no-results recovery polish
- Product card visual, metadata, availability, CTA, and focus-state polish
- Product visual fallback polish
- Product detail page gallery, purchase panel, seller block, description, and related-products polish
- Responsive/mobile pass

## 12. Remaining follow-ups

Recommended follow-ups after Phase 17B:

- Add richer public category metadata/counts if the repository gains a dedicated category read model.
- Consider interactive product gallery controls later if useful.
- Consider listing loading skeletons and sort/filter transitions in a later UI pass.
- Keep wishlist, reviews, refunds, payouts, and notifications out of this phase.
