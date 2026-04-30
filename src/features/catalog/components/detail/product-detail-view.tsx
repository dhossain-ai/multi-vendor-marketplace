import Link from "next/link";
import { Container } from "@/components/ui/container";
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

          <div className="border-border bg-panel rounded-[2rem] border p-5 shadow-[var(--shadow-panel)] sm:p-7">
            <div className="space-y-5">
              <div className="space-y-3">
                {product.category ? (
                  <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
                    {product.category.name}
                  </p>
                ) : null}
                <h1 className="text-foreground text-3xl font-semibold tracking-tight md:text-4xl">
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
                  <p className="text-ink-muted text-sm">Checkout</p>
                  <p className="text-foreground mt-1 text-base font-medium">
                    Secure payment at checkout
                  </p>
                </div>
              </div>

              <div className="bg-panel-muted rounded-[1.5rem] p-5">
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

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-[1.5rem] bg-panel-muted p-4">
                  <p className="text-sm font-medium text-foreground">Saved orders</p>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">
                    Purchases stay visible in your account after checkout.
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-panel-muted p-4">
                  <p className="text-sm font-medium text-foreground">Trusted sellers</p>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">
                    Listings are shown only when the seller is approved to sell.
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-panel-muted p-4">
                  <p className="text-sm font-medium text-foreground">Secure checkout</p>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">
                    Payment is completed securely with Stripe.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {relatedProducts.length > 0 ? (
          <section className="space-y-6">
            <div className="space-y-2">
              <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
                You may also like
              </p>
              <h2 className="text-foreground text-3xl font-semibold tracking-tight">
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
