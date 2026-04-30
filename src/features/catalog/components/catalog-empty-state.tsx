import Link from "next/link";

export function CatalogEmptyState() {
  return (
    <div className="border-border bg-panel rounded-[2rem] border border-dashed p-10 text-center shadow-[var(--shadow-panel)]">
      <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
        No products available
      </p>
      <h2 className="text-foreground mt-3 text-2xl font-semibold tracking-tight">
        Fresh products will appear here as sellers publish inventory.
      </h2>
      <p className="text-ink-muted mx-auto mt-4 max-w-2xl text-sm leading-7">
        We&apos;re keeping the storefront ready for active listings only, so hidden
        or unavailable products never appear in the shopping experience.
      </p>
      <Link
        href="/products"
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-white"
      >
        Browse products
      </Link>
    </div>
  );
}
