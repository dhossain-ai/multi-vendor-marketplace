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
            Public catalog foundation
          </span>
          <div className="space-y-4">
            <h1 className="text-foreground max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">
              Browse the first marketplace-ready catalog slice.
            </h1>
            <p className="text-ink-muted max-w-2xl text-lg leading-8">
              This page now reads from a dedicated catalog repository layer,
              serves only publicly visible products, and sets up the data shape
              that future auth, cart, and checkout work can safely build on.
            </p>
          </div>
        </div>

        <div className="border-border bg-panel-muted rounded-[2rem] border p-6 shadow-[var(--shadow-panel)]">
          <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
            Current listing state
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-white/80 p-5">
              <p className="text-ink-muted text-sm">Visible products</p>
              <p className="text-foreground mt-2 text-3xl font-semibold">
                {productCount}
              </p>
            </div>
            <div className="rounded-3xl bg-white/80 p-5">
              <p className="text-ink-muted text-sm">Read path</p>
              <p className="text-foreground mt-2 text-lg font-semibold">
                Listing and detail queries are separated
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
