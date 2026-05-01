# Phase 17A - Storefront Commerce UI Audit

## 1. Purpose

Audit the public storefront presentation before the Phase 17A commerce UI polish pass. The goal is to make the shopper-facing experience feel like a modern marketplace while preserving the existing catalog, role, checkout, seller approval, and visibility rules.

## 2. Scope

Reviewed shared public presentation and storefront discovery surfaces:

- `src/components/layout/`
- `src/components/ui/`
- `src/app/page.tsx`
- `src/app/products/page.tsx`
- `src/app/products/[slug]/`
- `src/features/catalog/components/`
- `src/features/catalog/components/cards/`
- `src/features/catalog/components/detail/`
- `src/features/catalog/lib/catalog-repository.ts`

No checkout, payment, seller operations, admin operations, schema, or migration behavior was changed during the audit.

## 3. Pages/components reviewed

- Global app shell, header, and footer
- Homepage storefront component
- Product listing route
- Product card/grid components
- Product visual fallback component
- Product detail view
- Public catalog repository visibility filters
- Customer cart link used in the header

## 4. Header/navigation issues

- Header included role-aware links, but it felt closer to a simple project nav than a commerce control center.
- Product search was missing from the global header, so shoppers had to navigate before searching.
- Desktop navigation had no clear two-tier marketplace structure for shop, account, seller, and admin destinations.
- Mobile navigation was wrapped, but search and key commerce destinations needed stronger touch-friendly layout.
- Cart access was present, but the header did not visually prioritize shopping actions enough.

## 5. Homepage issues

- Homepage had useful marketplace content but still felt sparse for a client-ready ecommerce storefront.
- Hero area leaned on text and statistics instead of product-led browsing cues.
- Category cards were simple and did not feel like visual departments.
- Homepage search/discovery was not prominent enough.
- Featured products existed, but there was no separate new-arrivals shelf or stronger marketplace trust rhythm.
- Seller call-to-action was not distinct enough from shopper content.

## 6. Product discovery issues

- `/products` supported search, category, sort, and pagination, but the layout felt utilitarian.
- Category browsing depended on active filters and homepage links; the listing page had no strong department strip.
- Search and sort forms worked, but the presentation did not feel like an ecommerce browse toolbar.
- Product count was present but not framed as a shopper-facing result summary.
- Empty state could use more direct recovery actions.

## 7. Product card/detail presentation issues

- Product cards showed the right marketplace fields but looked basic.
- Product image fallback used generic "Product Preview" wording instead of a polished commerce visual.
- Availability was plain text and did not clearly distinguish out-of-stock products.
- Description trimming relied on layout rather than a deliberate line clamp.
- Product detail page had the right sections, but the buy panel, gallery, seller/category labels, and trust notes needed stronger hierarchy.

## 8. Footer issues

- Footer was too thin for a marketplace.
- It lacked clear shop, account, seller, and trust sections.
- It did not provide enough closure after longer storefront pages.
- It correctly avoided fake policy links, and that constraint should remain.

## 9. Responsive/mobile issues

- Header wrapping reduced overflow risk, but the lack of a compact search row made mobile discovery weaker.
- Product listing controls stacked, but they needed clearer full-width mobile targets.
- Product cards and grids were responsive, but card height/CTA treatment needed more consistent ecommerce rhythm.
- Footer needed clean stacked sections on narrow screens.

## 10. Product visibility findings

Public catalog reads already enforce the important visibility contract in the repository:

- seller approved
- product active
- category active/valid
- product passes existing publish/visibility requirements
- not suspended, archived, or draft

Phase 17A must not weaken these rules to make the storefront look fuller. The homepage and listing page should continue using real products returned by the existing public catalog repository, with only the existing development fallback behavior remaining in place.

## 11. Fixes applied

- Added a marketplace announcement strip, global product search, stronger shop links, cart access, and role-aware account/seller/admin navigation to the header.
- Redesigned the homepage with product-led hero visuals, homepage search, department cards, featured products, new arrivals, trust messaging, and a seller CTA.
- Improved product visuals with a polished fallback treatment instead of broken or generic imagery.
- Upgraded product cards with stronger image hierarchy, price, category, seller, trimmed description, availability badge, and clearer "View details" CTA.
- Reworked `/products` with a stronger browse heading, search/sort toolbar, category chips, product count summary, pagination, and no-results recovery actions.
- Lightly polished product detail with better gallery sizing, title/price hierarchy, seller/category labels, availability badge, add-to-cart clarity, product detail section, and related products.
- Expanded the footer into a marketplace footer with brand summary, shop/account/seller links, trust copy, and a compact marketplace note.
- Checked mobile, tablet, and desktop layouts with local Chrome screenshots and tightened mobile header wrapping.

## 12. Remaining follow-ups

Recommended follow-ups for Phase 17B:

- Deeper product listing filters and saved sort/filter ergonomics
- Stronger product media/gallery treatment
- More advanced empty/no-results recovery
- Listing/detail loading and skeleton polish
- Better category data support if repository adds explicit public category counts later
