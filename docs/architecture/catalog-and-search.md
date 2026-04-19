# Catalog and Search

## Purpose

This document defines how catalog browsing, product detail loading, search, autocomplete, filtering, sorting, and related data-access behavior should work in the marketplace platform.

This area is important because catalog and search are the highest-read parts of the system. They must remain fast, predictable, and easy to extend without mixing too much business logic into the read path.

---

## Goals

### Primary Goals

- provide a fast and reliable catalog browsing experience
- support search-first discovery
- keep listing and detail queries index-aware
- make product visibility rules explicit
- keep search behavior consistent across UI and API

### Non-Goals

At this stage, catalog/search architecture does not aim to support:

- complex personalization engines
- advanced semantic ranking pipelines
- vector search infrastructure
- multi-index distributed search systems

The current design should remain simple, SQL-friendly, and scalable enough for a strong marketplace MVP.

---

## Core Responsibilities

Catalog and search are responsible for:

- public product listing
- product detail loading
- category browsing
- search query handling
- fuzzy search support
- autocomplete/typeahead
- filtering
- sorting
- pagination
- visibility rules for active products

---

## Product Visibility Model

## Publicly Visible Products

Only products that meet all required visibility conditions should appear in public catalog/search results.

Typical requirements:

- product status is `active`
- seller status is compatible with public selling
- product is not suspended
- category is valid if category visibility is enforced
- any required moderation rules are satisfied

## Non-Public Products

The following should not appear in public browsing by default:

- `draft` products
- `archived` products
- `suspended` products
- products from sellers who are not eligible to sell publicly if such policy is enforced

### Important Rule

Visibility logic must be enforced server-side in listing/detail queries, not only in UI rendering.

---

## Catalog Read Paths

## Listing Page

The listing page is the main read-heavy catalog surface.

It should support:

- default browsing
- category browsing
- search results
- filter combinations
- sorting
- pagination

### Listing Design Goals

- keep response shape stable
- keep data returned lightweight
- avoid over-fetching
- return only fields needed for listing cards
- avoid expensive joins unless clearly justified

### Typical Listing Fields

- id
- slug
- title
- short description
- thumbnail
- price
- currency
- seller summary
- category summary
- rating summary if available later

---

## Product Detail Page

## Purpose

The product detail page should provide a richer view than the listing page.

### Product Detail Should Include

- title
- slug
- long description
- pricing
- images
- category
- seller/store summary
- stock or availability state
- related items
- review summary if implemented

### Rules

- draft/suspended products should not be publicly accessible
- archived products may be hidden or shown as unavailable depending on product policy
- product detail should rely on stable identity such as slug or id
- if slugs change, redirection or not-found handling should be explicitly defined

---

## Search Architecture

## Current Direction

Search is already a foundational capability in the project.

Current or intended features:

- direct keyword search
- normalized query handling
- alias mapping
- fuzzy matching
- autocomplete suggestions

## Search Principles

- search should be tolerant of small input mistakes
- search should stay predictable
- search must not expose hidden products
- search should remain database-aware and index-aware
- search ranking should be simple and understandable at MVP stage

---

## Search Pipeline

## Recommended Search Flow

1. receive raw query
2. normalize query
3. apply alias mapping if relevant
4. determine search mode
5. execute search query or RPC
6. filter to publicly visible products
7. sort results
8. paginate results
9. return listing-safe response

### Query Normalization

Normalization may include:

- trim whitespace
- collapse repeated spaces
- lowercase comparison strategy where appropriate
- safe handling of punctuation
- alias normalization such as product nickname expansion if supported

### Important Rule

Normalization must not introduce incorrect broad matches that degrade trust.

---

## Fuzzy Search

## Purpose

Fuzzy search improves recall when users misspell or partially type product names.

## Recommended Use

Fuzzy matching should be used carefully on high-value searchable fields such as:

- product title
- alias terms if supported
- selected search-specific fields

## Rules

- fuzzy search should be bounded
- very short queries may require stricter rules
- fuzzy search must remain performant as product count grows
- fallback behavior should be documented if fuzzy search is unavailable or too weak

## Practical Guidance

If using PostgreSQL `pg_trgm`:

- keep searchable columns indexed appropriately
- monitor performance as dataset grows
- use thresholds that help typo tolerance without overmatching irrelevant products

---

## Autocomplete / Typeahead

## Purpose

Autocomplete provides fast, lightweight suggestions during typing.

## Design Goals

- quick response
- minimal payload
- simple ranking
- accessible interaction pattern
- safe server load

## Response Shape

Autocomplete should return lightweight suggestion data only, such as:

- product id
- title
- slug

### Rules

- limit result count aggressively
- debounce on client side
- rate-limit as needed
- avoid loading full product detail data
- exclude non-public products

---

## Filtering

## Supported Filters

Typical filters may include:

- category
- seller
- price range
- rating
- availability
- product-specific metadata where useful

## Rules

- filters must be validated server-side
- invalid filters must fail safely
- unsupported filters should not degrade into unpredictable query behavior
- filter combinations should be documented and tested

### Design Principle

The system should prefer a smaller number of well-supported filters over many weakly-defined filters.

---

## Sorting

## Recommended Sort Options

- relevance
- newest
- price ascending
- price descending
- rating
- popularity

## Rules

- sorting must be deterministic
- default sort should be explicit
- search result sorting may differ from category browsing sorting
- any computed ranking logic should be simple enough to explain

---

## Pagination

## Purpose

Pagination protects performance and response size.

## Rules

- catalog endpoints should always paginate large result sets
- page size should be bounded
- page and page size should be validated
- pagination behavior should remain stable as filters or sort options change

## Future Note

Cursor pagination may be introduced later for very hot listing paths, but page-based pagination is acceptable for MVP if implemented consistently.

---

## Category Architecture

## Purpose

Categories organize product discovery and support browsing.

## Rules

- category visibility should remain compatible with public listing rules
- category deletion should not break historical records
- category slugs should be stable and unique
- category hierarchy, if used, should remain simple and well-defined

---

## Data Access Strategy

## Listing Queries

Listing queries should:

- select only listing-safe columns
- avoid heavy joins on every request
- apply visibility conditions early
- use indexes aligned to filters and sort paths

## Detail Queries

Detail queries may load:

- richer product data
- image lists
- seller summary
- related products
- review summary later

### Important Rule

Do not reuse heavy detail queries for listing pages.

Keep listing and detail access paths intentionally separate.

---

## Search API vs Catalog API

## Catalog API

Primary responsibilities:

- standard listing
- filters
- sorting
- pagination
- public browsing

## Search API

Primary responsibilities:

- query-driven search
- autocomplete
- fuzzy search handling
- optional search-specific ranking logic

### Design Principle

Even if both use the same product table, search and catalog should remain conceptually separate in architecture and documentation.

---

## Performance Considerations

## High-Read Areas

Most read-heavy areas:

- home/catalog listing
- category pages
- search results
- autocomplete
- product detail pages

## Early Performance Rules

- index slug
- index product status
- index category/status combinations
- index seller/status combinations where useful
- use trigram index or equivalent for fuzzy search if staying in SQL
- keep autocomplete lightweight
- cap page size
- avoid deep join chains in hot queries

---

## Caching Considerations

## Good Early Candidates

Potential cache-friendly data:

- category lists
- public product listing responses if traffic grows
- product detail pages if invalidation policy is clear
- autocomplete for very common prefixes if later needed

## Important Rule

Do not introduce caching before query correctness and visibility rules are stable.

---

## Failure and Edge Cases

## Product No Longer Visible

If a product becomes inactive:

- it should disappear from listing/search
- detail behavior should follow documented unavailable/not-found policy

## Broken Slug or Missing Product

- return not-found safely
- do not expose hidden product state unintentionally

## Search Overload

- debounce client calls
- rate-limit server where needed
- bound fuzzy search costs

## Empty Results

- empty result states should be expected and rendered cleanly
- no-results behavior should not be treated as an error

## Stale Category Links

- if category becomes inactive or renamed, the system should fail predictably and not return misleading results

---

## Security and Access Notes

## Public Catalog

Public catalog must only show allowed products.

## Seller Views

Seller management views for products are separate from public catalog logic and should not reuse public visibility rules blindly.

## Admin Views

Admin catalog/product moderation views may include non-public products and additional metadata, but must remain separate from public APIs.

---

## Future Upgrade Paths

Possible later improvements:

- better ranking strategy
- product popularity scoring
- category-specific ranking
- search analytics
- query suggestion logs
- selective caching
- denormalized read models if scale demands it

These are not required for MVP.

---

## Related Documents

- `architecture/ARCHITECTURE_OVERVIEW.md`
- `FEATURE_SPEC.md`
- `DATABASE_SCHEMA.md`
- `API_SPEC.md`

---

## Summary

Catalog and search should remain:

- read-optimized
- visibility-safe
- index-aware
- simple enough to maintain
- flexible enough to grow into a stronger marketplace discovery system
