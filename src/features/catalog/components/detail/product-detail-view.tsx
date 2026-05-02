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
  const primaryImageUrl = product.images[0]?.url ?? product.thumbnailUrl;
  const galleryImages = product.images.slice(primaryImageUrl ? 1 : 0);

  return (
    <div className="py-10 md:py-14">
      <Container className="space-y-10">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
          <Link href="/" className="hover:text-foreground transition-colors">
            Shop
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-foreground transition-colors">
            Products
          </Link>
          <span>/</span>
          {product.category ? (
            <>
              <Link
                href={`/products?category=${product.category.slug}`}
                className="transition-colors hover:text-foreground"
              >
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          ) : null}
          <span className="line-clamp-1 text-foreground">{product.title}</span>
        </nav>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(23rem,0.9fr)]">
          <div className="space-y-4">
            <ProductVisual
              title={product.title}
              imageUrl={primaryImageUrl}
              categoryName={product.category?.name}
              className="aspect-[4/3] min-h-[22rem] md:min-h-[34rem]"
            />

            {galleryImages.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {galleryImages.slice(0, 3).map((image, index) => (
                  <ProductVisual
                    key={`${product.id}-${image.url}`}
                    title={image.alt || `${product.title} image ${index + 2}`}
                    imageUrl={image.url}
                    categoryName={product.category?.name}
                    className="aspect-[4/3] h-auto min-h-28"
                  />
                ))}
              </div>
            ) : null}
          </div>

          <aside className="rounded-2xl border border-border bg-white/86 p-5 shadow-[var(--shadow-panel)] sm:p-7 lg:sticky lg:top-40 lg:self-start">
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
                    className="min-h-8 px-3"
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

              <div className="rounded-2xl border border-border bg-panel-muted p-5">
                <p className="text-sm text-ink-muted">Price</p>
                <p className="mt-1 text-4xl font-semibold tracking-tight text-foreground">
                  {formatPrice(product.priceAmount, product.currencyCode)}
                </p>
                <p className="mt-3 text-sm leading-6 text-ink-muted">
                  Final cart totals are checked again during checkout.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-white p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Add this item to your cart
                    </p>
                    <p className="mt-1 text-sm text-ink-muted">
                      Quantity starts at 1 and can be adjusted in the cart.
                    </p>
                  </div>
                  <span
                    className={
                      product.isPurchasable
                        ? "mt-1 h-3 w-3 shrink-0 rounded-full bg-emerald-500"
                        : "mt-1 h-3 w-3 shrink-0 rounded-full bg-amber-500"
                    }
                    aria-hidden="true"
                  />
                </div>
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

              <section className="rounded-2xl border border-border bg-panel-muted p-5">
                <p className="text-sm font-semibold uppercase text-brand">
                  Seller
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {product.seller?.name ?? "Marketplace seller"}
                </p>
                <p className="mt-2 text-sm leading-6 text-ink-muted">
                  Public listings come from sellers currently approved to sell on
                  the marketplace.
                </p>
              </section>

              <ul className="grid gap-3 text-sm leading-6 text-ink-muted">
                {[
                  "Purchases stay visible in your account after checkout.",
                  "Cart and checkout checks run on the server.",
                  "Payment is completed through secure checkout.",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </section>

        <section className="grid gap-6 rounded-2xl border border-border bg-white/74 p-5 shadow-sm md:p-7 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
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
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-border bg-white/78 p-4">
                <p className="text-xs font-semibold uppercase text-brand">Seller</p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {product.seller?.name ?? "Marketplace seller"}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-white/78 p-4">
                <p className="text-xs font-semibold uppercase text-brand">Department</p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {product.category?.name ?? "Marketplace"}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-white/78 p-4">
                <p className="text-xs font-semibold uppercase text-brand">Availability</p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {product.availabilityLabel}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-white/78 p-4">
                <p className="text-xs font-semibold uppercase text-brand">Checkout</p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  Secure cart flow
                </p>
              </div>
            </div>
          </div>
        </section>

        {relatedProducts.length > 0 ? (
          <section className="space-y-6 rounded-2xl border border-border bg-white/54 p-5 md:p-7">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase text-brand">
                  Related products
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                  More to explore
                </h2>
              </div>
              <Link
                href={
                  product.category
                    ? `/products?category=${product.category.slug}`
                    : "/products"
                }
                className="inline-flex min-h-11 w-fit items-center justify-center rounded-full border border-border bg-white px-5 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/20"
              >
                Browse similar products
              </Link>
            </div>
            <ProductGrid products={relatedProducts} />
          </section>
        ) : null}
      </Container>
    </div>
  );
}
