import { ProductCard } from "@/features/catalog/components/cards/product-card";
import type { ProductSummary } from "@/features/catalog/types";

type ProductGridProps = {
  products: ProductSummary[];
};

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
