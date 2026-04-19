const layers = [
  {
    title: "App layer",
    description:
      "Route segments, layouts, metadata, and public page composition.",
  },
  {
    title: "Shared components",
    description:
      "Reusable layout and UI primitives kept separate from domain logic.",
  },
  {
    title: "Feature boundaries",
    description:
      "Catalog and shared folders exist now so later slices stay isolated.",
  },
  {
    title: "Infrastructure layer",
    description:
      "Supabase clients, env access, auth role primitives, and utility helpers.",
  },
];

export function CatalogFoundationPanel() {
  return (
    <div className="border-border bg-panel rounded-[2rem] border p-6 shadow-[var(--shadow-panel)]">
      <div className="max-w-2xl">
        <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
          Architecture-Friendly Baseline
        </p>
        <h2 className="text-foreground mt-3 text-2xl font-semibold tracking-tight">
          The repo is prepared for growth without pretending features already
          exist.
        </h2>
        <p className="text-ink-muted mt-3 text-sm leading-7">
          This structure follows the docs&apos; modular-monolith direction: UI stays
          lightweight, domain folders are explicit, and infrastructure concerns
          live in predictable shared modules.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {layers.map((layer) => (
          <article
            key={layer.title}
            className="border-border/80 rounded-3xl border bg-white/75 p-5"
          >
            <h3 className="text-foreground text-base font-semibold">
              {layer.title}
            </h3>
            <p className="text-ink-muted mt-2 text-sm leading-6">
              {layer.description}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
