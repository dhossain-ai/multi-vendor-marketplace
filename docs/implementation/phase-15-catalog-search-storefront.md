# Phase 15: Catalog, Search, and Storefront Reliability

## Overview
This phase focused on stabilizing the public storefront and catalog layer, specifically addressing the Next.js static generation issue caused by `cookies()` usage, and formalizing the product listing routes with server-enforced visibility rules.

## Catalog Data Flow
### Before
- All catalog operations (public reads, user data) used `createSupabaseServerClient`.
- Next.js detected `cookies()` usage in `generateStaticParams` and public routes, causing dynamic rendering errors and triggering a permanent fallback to demo data for static pages during build.
- The storefront had no unified `/products` listing page, relying solely on limited homepage highlights.

### After
- **Public Reads Separated**: Introduced `createSupabasePublicClient` which interacts with Supabase without attempting to read or write Next.js cookies, making it completely static-friendly.
- **Catalog Repository Updated**: Refactored `listPublicProducts`, `getPublicProductBySlug`, and `listRelatedProducts` to use the cookie-free public client.
- **Listing Page Created**: Built a robust `/products` route for comprehensive storefront browsing.

## `cookies()` Warning Fix
**Cause**: The shared Supabase client inherently called Next.js `cookies().getAll()`, forcing dynamic opt-in during build. `generateStaticParams` for `/products/[slug]` failed gracefully via a try/catch, masking the fact that no actual SSG params were generated.
**Fix**: `createSupabasePublicClient` initializes standard `@supabase/supabase-js` without a session persister and without Next.js headers/cookies dependencies. Build statically prerenders `[slug]` pages successfully, emitting no dynamic server warnings.

## `/products` Listing Behavior
- Available at `/products`.
- Implements SSR rendering to allow flexible filtering without over-bloating the client.
- Includes an empty state (`CatalogEmptyState`) consistent with other features.

## Search, Filter, Sort, Pagination
The catalog repository now implements `searchPublicProducts` backed by:
- `q`: Partial matching on product title (`ilike` for Supabase, in-memory for Demo).
- `category`: Exact match on category slug.
- `sort`: Supports `newest`, `price_asc`, `price_desc`, and `relevance`. Defaults to `relevance` when searching, and `newest` otherwise.
- `page`/`pageSize`: Server-side pagination bounds. Handled efficiently via `.range()` in Supabase.
All bounds and validations occur smoothly in `src/app/products/page.tsx` and the query layer.

## Visibility Enforcement
All public storefront queries enforce the following rule set directly at the query/filter level:
1. `product.status === "active"`
2. `seller.status === "approved"`
3. `category.is_active === true`
This is applied natively in both the `supabase` and `demo` implementations of the catalog. The UI does not need to filter these, preventing potential exposure leaks in raw JSON payloads.

## Demo Fallback Policy
The `withSupabaseFallback` wrapper strategy remains but is strictly reserved for safety during local dev/demo scenarios where a local Supabase instance is unavailable or missing configuration.
- The wrapper caches errors and falls back so the build continues.
- Because the `cookies()` bug is fixed, the fallback is no longer masking build-time static generation failures silently. The production pipeline accurately uses live database parameters.

## Product Detail & Storefront Impact
- `ProductDetailView` behaves predictably, routing to 404 (`notFound()`) if a product goes offline (or seller is suspended), thanks to the unified visibility checks.
- Homepage (`StorefrontHome`) updated to direct customers to `/products` via "Shop all products" CTA instead of the previous `/#featured` anchor.

## Remaining Risks & Follow-ups
1. **Full-Text Search**: Currently, Supabase search is an `.ilike()` match on `title`. A true Full-Text Search configuration on Postgres using standard `to_tsvector` is recommended when catalog sizes scale up.
2. **Price Range Filtering**: Min/Max price filters were deferred to maintain a clean MVP subset.
3. **Autocomplete**: No full autocomplete implementation was needed yet. A debounced `/api/search` could be created next.
4. **Wishlist/Reviews**: Explicitly deferred out of Phase 15.

## Next Steps
Proceeding to Phase 16.
