export function CatalogEmptyState() {
  return (
    <div className="border-border bg-panel rounded-[2rem] border border-dashed p-10 text-center shadow-[var(--shadow-panel)]">
      <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
        Catalog is empty
      </p>
      <h2 className="text-foreground mt-3 text-2xl font-semibold tracking-tight">
        Public products will appear here once approved inventory is available.
      </h2>
      <p className="text-ink-muted mx-auto mt-4 max-w-2xl text-sm leading-7">
        The listing page stays visibility-safe and does not surface draft,
        suspended, or otherwise unavailable products.
      </p>
    </div>
  );
}
