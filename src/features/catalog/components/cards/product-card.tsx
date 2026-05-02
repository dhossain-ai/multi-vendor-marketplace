import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProductVisual } from "@/features/catalog/components/product-visual";
import { formatPrice } from "@/features/catalog/lib/format-price";
import type { ProductSummary } from "@/features/catalog/types";

type ProductCardProps = {
  product: ProductSummary;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white/86 shadow-[var(--shadow-panel)] transition duration-200 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-xl">
      <Link
        href={`/products/${product.slug}`}
        className="flex h-full flex-col focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/25"
        aria-label={`View ${product.title}`}
      >
        <ProductVisual
          title={product.title}
          imageUrl={product.thumbnailUrl}
          categoryName={product.category?.name}
          className="aspect-[4/3] h-auto rounded-none border-0"
        >
          <div className="flex h-full flex-col justify-between p-4">
            <div className="flex items-start justify-between gap-2">
              {product.category ? (
                <span className="rounded-full bg-white/86 px-3 py-1 text-xs font-semibold uppercase text-brand shadow-sm">
                  {product.category.name}
                </span>
              ) : (
                <span />
              )}
              <span className="rounded-full bg-foreground/90 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                {formatPrice(product.priceAmount, product.currencyCode)}
              </span>
            </div>
          </div>
        </ProductVisual>

        <div className="flex flex-1 flex-col gap-4 p-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              {product.category ? (
                <p className="line-clamp-1 text-xs font-semibold uppercase text-brand">
                  {product.category.name}
                </p>
              ) : null}
              <p className="shrink-0 text-lg font-semibold text-foreground">
                {formatPrice(product.priceAmount, product.currencyCode)}
              </p>
            </div>
            <h3 className="line-clamp-2 text-xl font-semibold tracking-tight text-foreground">
              {product.title}
            </h3>
            {product.seller?.name ? (
              <p className="line-clamp-1 text-sm text-ink-muted">
                Sold by <span className="font-medium text-foreground">{product.seller.name}</span>
              </p>
            ) : null}
          </div>

          <p className="line-clamp-3 text-sm leading-6 text-ink-muted">
            {product.shortDescription}
          </p>

          <div className="mt-auto flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <StatusBadge
              label={product.availabilityLabel}
              tone={product.isPurchasable ? "success" : "warning"}
              className="w-fit capitalize"
            />
            <span className="inline-flex min-h-11 items-center justify-center rounded-full bg-foreground px-5 text-sm font-semibold text-white transition group-hover:bg-brand">
              View details
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
