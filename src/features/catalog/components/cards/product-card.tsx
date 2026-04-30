import Link from "next/link";
import { ProductVisual } from "@/features/catalog/components/product-visual";
import { formatPrice } from "@/features/catalog/lib/format-price";
import type { ProductSummary } from "@/features/catalog/types";

type ProductCardProps = {
  product: ProductSummary;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="border-border bg-panel group overflow-hidden rounded-[2rem] border shadow-[var(--shadow-panel)] transition-transform duration-200 hover:-translate-y-1">
      <Link href={`/products/${product.slug}`} className="block">
        <ProductVisual
          title={product.title}
          imageUrl={product.thumbnailUrl}
          className="h-56"
        />

        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              {product.category ? (
                <p className="text-brand text-xs font-semibold tracking-[0.16em] uppercase">
                  {product.category.name}
                </p>
              ) : null}
              <h3 className="text-foreground text-lg font-semibold tracking-tight">
                {product.title}
              </h3>
              {product.seller?.name ? (
                <p className="text-ink-muted text-sm">Sold by {product.seller.name}</p>
              ) : null}
            </div>
            <p className="text-foreground text-base font-semibold">
              {formatPrice(product.priceAmount, product.currencyCode)}
            </p>
          </div>

          <p className="text-ink-muted text-sm leading-6">
            {product.shortDescription}
          </p>

          <div className="text-ink-muted flex items-center justify-between gap-3 text-sm">
            <span>{product.availabilityLabel}</span>
            <span className="text-brand font-medium">View details</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
