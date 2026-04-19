import { CatalogFoundationPanel } from "@/features/catalog/components/catalog-foundation-panel";
import { HomepageHero } from "@/features/shared/components/homepage-hero";
import { PhaseChecklist } from "@/features/shared/components/phase-checklist";

export default function Home() {
  return (
    <>
      <HomepageHero />
      <section className="border-border/70 border-t bg-white/70 py-16">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 lg:grid-cols-[1.35fr_1fr] lg:px-8">
          <CatalogFoundationPanel />
          <PhaseChecklist />
        </div>
      </section>
    </>
  );
}
