# Phase 7: Seller Product and Inventory Rules

## Summary
Phase 7 introduces complete seller product and inventory management rules. It makes the seller product management client-ready and enforces real marketplace product publishing rules according to the multi-vendor blueprint.

## Product Lifecycle Behavior
Products follow strict lifecycle rules:
- **Draft**: Not public. Can be edited by an approved seller. Does not require an image.
- **Active**: Publicly visible if the seller is approved and the category is active. Purchasable only if inventory allows. Can be archived.
- **Archived**: Not purchasable and not shown in normal public catalog. Kept for history. Can be edited.
- **Suspended**: Admin-controlled state. Hidden from the catalog. Sellers cannot reactivate or edit suspended products.

## Publishing Validation
Publishing a product to `active` requires:
- Approved seller status (enforced by `requireApprovedSeller` and repository checks).
- Seller must own the product (enforced by `seller_id` match in repository).
- Title, slug, description, short description, and positive price.
- Valid `categoryId` from active categories list.
- At least one image (either `thumbnailUrl` or a gallery image).
- Valid inventory configuration.
- Product not admin-suspended.

## Inventory Behavior
- **Unlimited Stock**: `stockQuantity` is ignored if `isUnlimitedStock` is true.
- **Limited Stock**: If `isUnlimitedStock` is false, `stockQuantity` must be an integer >= 0. For an `active` product, it must be >= 1.
- **Low Stock Threshold**: Explicit support for `products.low_stock_threshold` was added to schemas, forms, and validation. Defaults to 5.
- The cart block purchases if an item is out of stock or if the product/seller/category is not in a fully active/approved state.

## Product List/Form Behavior
- **Seller Product Form**:
  - Contains explicit sections for merchandising (Category, Images, Status) and Pricing/Stock.
  - Added explicit field for `lowStockThreshold`.
- **Seller Product List**:
  - Inventory labels explicitly denote Unlimited Stock, Low stock (using the product's custom threshold), Out of stock, and Archived.
  - Uses specific conditional buttons: editing, archiving, and labels for suspended or archived items.
  - Lists the updated date of the product.

## Security/Permission Behavior
- `seller_id` is never accepted from client form data. It is always derived from the server session (`session.sellerProfile.id`).
- All product mutation functions specifically query with `.eq("seller_id", sellerProfileId)` to ensure cross-tenant safety.
- Suspended products reject `updateSellerProduct` and `archiveSellerProduct` calls completely to prevent sellers from circumventing admin blocks.

## Public Catalog/Cart Impact
- `isPublicVisibilitySatisfied` correctly filters out products that are draft, suspended, archived, belong to unapproved sellers, or are in inactive categories.
- Cart uses `getAvailability` to enforce strict out-of-stock and status rules during checkout review.

## Known Follow-ups for Phase 8
- Implement order fulfillment tracking and statuses.
- Advanced shipping zones or shipping classes per product.
- Final checkout integration testing for split-seller orders.
