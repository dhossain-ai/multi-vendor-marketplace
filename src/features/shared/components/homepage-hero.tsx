import { Container } from "@/components/ui/container";

const pillars = [
  "Modular monolith structure aligned with the architecture docs",
  "Next.js App Router foundation with TypeScript and Tailwind CSS",
  "Supabase client scaffolding prepared for auth, catalog, and checkout phases",
];

export function HomepageHero() {
  return (
    <section className="py-16 md:py-24">
      <Container className="grid items-start gap-8 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-6">
          <span className="border-brand/20 bg-brand-soft text-brand inline-flex rounded-full border px-4 py-2 text-sm font-medium">
            Repository bootstrap completed
          </span>
          <div className="space-y-4">
            <h1 className="text-foreground max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
              Marketplace foundation built for the next implementation phases.
            </h1>
            <p className="text-ink-muted max-w-2xl text-lg leading-8">
              This baseline keeps the codebase intentionally lean while setting
              up the folders, tooling, and environment scaffolding needed for
              catalog hardening, auth and roles, cart, checkout, and payments.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {pillars.map((pillar) => (
              <div
                key={pillar}
                className="border-border bg-panel rounded-3xl border p-4 shadow-[var(--shadow-panel)]"
              >
                <p className="text-foreground text-sm leading-6">{pillar}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-border bg-panel-muted rounded-[2rem] border p-6 shadow-[var(--shadow-panel)]">
          <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
            Ready For Phase 2
          </p>
          <div className="text-ink-muted mt-5 space-y-4 text-sm leading-7">
            <p>
              The homepage is intentionally a placeholder shell rather than a
              fake storefront. It gives us a stable presentation layer without
              locking in product behavior prematurely.
            </p>
            <p>
              The next product-facing slice should add real catalog detail
              routes and data access patterns on top of this foundation.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
