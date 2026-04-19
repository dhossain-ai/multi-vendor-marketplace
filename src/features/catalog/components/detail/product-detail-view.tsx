import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ProductGrid } from "@/features/catalog/components/cards/product-grid";
import { ProductVisual } from "@/features/catalog/components/product-visual";
import { formatPrice } from "@/features/catalog/lib/format-price";
import type { ProductDetail, ProductSummary } from "@/features/catalog/types";

type ProductDetailViewProps = {
  product: ProductDetail;
  relatedProducts: ProductSummary[];
};

export function ProductDetailView({
  product,
  relatedProducts,
}: ProductDetailViewProps) {
  return (
    <div className="py-14 md:py-20">
      <Container className="space-y-12">
        <nav className="text-ink-muted flex items-center gap-2 text-sm">
          <Link href="/" className="hover:text-foreground transition-colors">
            Catalog
          </Link>
          <span>/</span>
          <span>{product.title}</span>
        </nav>

        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <ProductVisual
              title={product.title}
              imageUrl={product.images[0]?.url ?? product.thumbnailUrl}
              className="h-[24rem] md:h-[32rem]"
            />

            {product.images.length > 1 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {product.images.slice(1).map((image) => (
                  <ProductVisual
                    key={`${product.id}-${image.url}`}
                    title={image.alt}
                    imageUrl={image.url}
                    className="h-48"
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="border-border bg-panel rounded-[2rem] border p-7 shadow-[var(--shadow-panel)]">
            <div className="space-y-5">
              <div className="space-y-3">
                {product.category ? (
                  <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
                    {product.category.name}
                  </p>
                ) : null}
                <h1 className="text-foreground text-4xl font-semibold tracking-tight">
                  {product.title}
                </h1>
                <p className="text-ink-muted text-base leading-7">
                  {product.description}
                </p>
              </div>

              <div className="border-border grid gap-4 border-y py-5 sm:grid-cols-2">
                <div>
                  <p className="text-ink-muted text-sm">Price</p>
                  <p className="text-foreground mt-1 text-2xl font-semibold">
                    {formatPrice(product.priceAmount, product.currencyCode)}
                  </p>
                </div>
                <div>
                  <p className="text-ink-muted text-sm">Availability</p>
                  <p className="text-foreground mt-1 text-base font-medium">
                    {product.availabilityLabel}
                  </p>
                </div>
                <div>
                  <p className="text-ink-muted text-sm">Seller</p>
                  <p className="text-foreground mt-1 text-base font-medium">
                    {product.seller?.name ?? "Marketplace seller"}
                  </p>
                </div>
                <div>
                  <p className="text-ink-muted text-sm">Slug</p>
                  <p className="text-foreground mt-1 text-base font-medium">
                    {product.slug}
                  </p>
                </div>
              </div>

              <div className="bg-panel-muted rounded-[1.5rem] p-5">
                <p className="text-ink-muted text-sm leading-7">
                  This product page is intentionally public-only for now. Cart,
                  checkout, and account-aware actions will arrive in later
                  phases once auth and commerce rules are in place.
                </p>
              </div>
            </div>
          </div>
        </section>

        {relatedProducts.length > 0 ? (
          <section className="space-y-6">
            <div className="space-y-2">
              <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
                Related products
              </p>
              <h2 className="text-foreground text-3xl font-semibold tracking-tight">
                More from the public catalog
              </h2>
            </div>
            <ProductGrid products={relatedProducts} />
          </section>
        ) : null}
      </Container>
    </div>
  );
}
