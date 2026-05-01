import Link from "next/link";
import { Container } from "@/components/ui/container";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProductGrid } from "@/features/catalog/components/cards/product-grid";
import { ProductVisual } from "@/features/catalog/components/product-visual";
import { formatPrice } from "@/features/catalog/lib/format-price";
import { AddToCartForm } from "@/features/cart/components/add-to-cart-form";
import type { ProductDetail, ProductSummary } from "@/features/catalog/types";

type ProductDetailViewProps = {
  product: ProductDetail;
  relatedProducts: ProductSummary[];
  nextPath: string;
  cartError?: string | null;
};

export function ProductDetailView({
  product,
  relatedProducts,
  nextPath,
  cartError,
}: ProductDetailViewProps) {
  return (
    <div className="py-14 md:py-20">
      <Container className="space-y-12">
        <nav className="text-ink-muted flex items-center gap-2 text-sm">
          <Link href="/" className="hover:text-foreground transition-colors">
            Shop
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-foreground transition-colors">
            Products
          </Link>
          <span>/</span>
          <span>{product.title}</span>
        </nav>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.92fr)]">
          <div className="space-y-4">
            <ProductVisual
              title={product.title}
              imageUrl={product.images[0]?.url ?? product.thumbnailUrl}
              className="h-[24rem] md:h-[34rem]"
            />

            {product.images.length > 1 ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {product.images.slice(1).map((image) => (
                  <ProductVisual
                    key={`${product.id}-${image.url}`}
                    title={image.alt}
                    imageUrl={image.url}
                    className="h-32"
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-border bg-white/82 p-5 shadow-[var(--shadow-panel)] sm:p-7 lg:sticky lg:top-40 lg:self-start">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {product.category ? (
                    <Link
                      href={`/products?category=${product.category.slug}`}
                      className="inline-flex min-h-8 items-center rounded-full bg-brand-soft px-3 text-xs font-semibold uppercase text-brand"
                    >
                      {product.category.name}
                    </Link>
                  ) : null}
                  <StatusBadge
                    label={product.availabilityLabel}
                    tone={product.isPurchasable ? "success" : "warning"}
                  />
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                  {product.title}
                </h1>
                <p className="text-sm font-medium text-ink-muted">
                  Sold by{" "}
                  <span className="text-foreground">
                    {product.seller?.name ?? "Marketplace seller"}
                  </span>
                </p>
              </div>

              <div className="border-y border-border py-5">
                <div>
                  <p className="text-sm text-ink-muted">Price</p>
                  <p className="mt-1 text-3xl font-semibold text-foreground">
                    {formatPrice(product.priceAmount, product.currencyCode)}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-panel-muted p-5">
                <p className="mb-4 text-sm font-semibold text-foreground">
                  Add this item to your cart
                </p>
                {product.isPurchasable ? (
                  <AddToCartForm productId={product.id} nextPath={nextPath} />
                ) : (
                  <p className="text-sm font-medium text-amber-800">
                    This product is currently out of stock and cannot be added to cart.
                  </p>
                )}
                {cartError ? (
                  <p className="mt-3 text-sm leading-6 text-rose-700">
                    {cartError}
                  </p>
                ) : null}
              </div>

              <ul className="grid gap-3 text-sm leading-6 text-ink-muted">
                <li className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  Purchases stay visible in your account after checkout.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sky-500" />
                  Listings are shown only when the seller is approved to sell.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand" />
                  Payment is completed through secure checkout.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="grid gap-6 border-y border-border py-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
          <div>
            <p className="text-sm font-semibold uppercase text-brand">
              Product details
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              What to know before you buy
            </h2>
          </div>
          <div className="space-y-4 text-base leading-8 text-ink-muted">
            <p>{product.description}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/72 p-4">
                <p className="text-xs font-semibold uppercase text-brand">Seller</p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {product.seller?.name ?? "Marketplace seller"}
                </p>
              </div>
              <div className="rounded-2xl bg-white/72 p-4">
                <p className="text-xs font-semibold uppercase text-brand">Department</p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {product.category?.name ?? "Marketplace"}
                </p>
              </div>
              <div className="rounded-2xl bg-white/72 p-4">
                <p className="text-xs font-semibold uppercase text-brand">Availability</p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {product.availabilityLabel}
                </p>
              </div>
            </div>
          </div>
        </section>

        {relatedProducts.length > 0 ? (
          <section className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase text-brand">
                Related products
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                More to explore
              </h2>
            </div>
            <ProductGrid products={relatedProducts} />
          </section>
        ) : null}
      </Container>
    </div>
  );
}
