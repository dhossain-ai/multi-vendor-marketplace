import Link from "next/link";

export function CatalogEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-white/82 p-8 text-center shadow-[var(--shadow-panel)] md:p-10">
      <p className="text-sm font-semibold uppercase text-brand">
        No products available
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
        Fresh products will appear here as sellers publish inventory.
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-ink-muted">
        The storefront only shows products that are ready for customers to browse.
        Try browsing all products or return to the homepage.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/products"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-white transition hover:bg-foreground focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/25"
        >
          Browse products
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-white px-5 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/20"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}
