import Link from "next/link";
import { Container } from "@/components/ui/container";

export function OrdersEmptyState() {
  return (
    <div className="py-16">
      <Container className="border-border bg-panel rounded-[2rem] border p-10 text-center shadow-[var(--shadow-panel)]">
        <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
          No orders yet
        </p>
        <h1 className="text-foreground mt-4 text-3xl font-semibold tracking-tight">
          Pending orders will appear here after checkout
        </h1>
        <p className="text-ink-muted mx-auto mt-4 max-w-2xl text-sm leading-7">
          Order history now reads from snapshot-backed order records, but no
          pending order has been created for this account yet.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/cart"
            className="border-border bg-panel-muted text-foreground inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-medium"
          >
            Open cart
          </Link>
          <Link
            href="/"
            className="bg-brand inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-white"
          >
            Browse catalog
          </Link>
        </div>
      </Container>
    </div>
  );
}
