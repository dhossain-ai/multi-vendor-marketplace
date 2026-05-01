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
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white/82 shadow-[var(--shadow-panel)] transition duration-200 hover:-translate-y-1 hover:border-foreground/20">
      <Link href={`/products/${product.slug}`} className="flex h-full flex-col">
        <ProductVisual
          title={product.title}
          imageUrl={product.thumbnailUrl}
          className="h-52 rounded-none border-0 sm:h-56"
        />

        <div className="flex flex-1 flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              {product.category ? (
                <p className="text-xs font-semibold uppercase text-brand">
                  {product.category.name}
                </p>
              ) : null}
              <h3 className="line-clamp-2 text-lg font-semibold tracking-tight text-foreground">
                {product.title}
              </h3>
              {product.seller?.name ? (
                <p className="line-clamp-1 text-sm text-ink-muted">
                  Sold by {product.seller.name}
                </p>
              ) : null}
            </div>
            <p className="shrink-0 text-base font-semibold text-foreground">
              {formatPrice(product.priceAmount, product.currencyCode)}
            </p>
          </div>

          <p className="line-clamp-3 text-sm leading-6 text-ink-muted">
            {product.shortDescription}
          </p>

          <div className="mt-auto flex items-center justify-between gap-3 pt-2">
            <StatusBadge
              label={product.availabilityLabel}
              tone={product.isPurchasable ? "success" : "warning"}
              className="capitalize"
            />
            <span className="inline-flex min-h-10 items-center justify-center rounded-full bg-foreground px-4 text-sm font-semibold text-white transition group-hover:bg-brand">
              View details
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
