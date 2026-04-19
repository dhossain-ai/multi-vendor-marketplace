import { Container } from "@/components/ui/container";
import { CatalogEmptyState } from "@/features/catalog/components/catalog-empty-state";
import { CatalogHero } from "@/features/catalog/components/catalog-hero";
import { ProductGrid } from "@/features/catalog/components/cards/product-grid";
import { listPublicProducts } from "@/features/catalog/lib/catalog-repository";

export default async function Home() {
  const catalog = await listPublicProducts();

  return (
    <>
      <CatalogHero productCount={catalog.products.length} />
      <section className="border-border/70 border-t bg-white/70 py-16">
        <Container className="space-y-8">
          <div className="space-y-3">
            <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
              Public products
            </p>
            <h2 className="text-foreground text-3xl font-semibold tracking-tight">
              Lightweight listing cards backed by the catalog repository
            </h2>
            <p className="text-ink-muted max-w-3xl text-sm leading-7">
              The homepage now acts as the public catalog landing page. Listing
              reads remain lightweight, while richer data stays reserved for the
              product detail route.
            </p>
          </div>

          {catalog.products.length > 0 ? (
            <ProductGrid products={catalog.products} />
          ) : (
            <CatalogEmptyState />
          )}
        </Container>
      </section>
    </>
  );
}
