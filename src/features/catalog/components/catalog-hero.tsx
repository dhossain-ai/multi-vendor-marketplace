import { Container } from "@/components/ui/container";

type CatalogHeroProps = {
  productCount: number;
};

export function CatalogHero({ productCount }: CatalogHeroProps) {
  return (
    <section className="py-16 md:py-24">
      <Container className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div className="space-y-6">
          <span className="text-brand bg-brand-soft border-brand/20 inline-flex rounded-full border px-4 py-2 text-sm font-medium">
            Marketplace storefront
          </span>
          <div className="space-y-4">
            <h1 className="text-foreground max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">
              Discover products from approved marketplace sellers.
            </h1>
            <p className="text-ink-muted max-w-2xl text-lg leading-8">
              Browse categories, discover new arrivals, and shop a clean storefront
              built for real customer journeys.
            </p>
          </div>
        </div>

        <div className="border-border bg-panel-muted rounded-[2rem] border p-6 shadow-[var(--shadow-panel)]">
          <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
            Storefront snapshot
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-white/80 p-5">
              <p className="text-ink-muted text-sm">Visible products</p>
              <p className="text-foreground mt-2 text-3xl font-semibold">
                {productCount}
              </p>
            </div>
            <div className="rounded-3xl bg-white/80 p-5">
              <p className="text-ink-muted text-sm">Shopping experience</p>
              <p className="text-foreground mt-2 text-lg font-semibold">
                Browse, add to cart, and check out with confidence
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
