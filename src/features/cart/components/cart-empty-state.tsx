import Link from "next/link";
import { Container } from "@/components/ui/container";

export function CartEmptyState() {
  return (
    <div className="py-12 md:py-16">
      <Container className="border-border bg-panel rounded-[2rem] border p-6 text-center shadow-[var(--shadow-panel)] sm:p-10">
        <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
          Your cart is empty
        </p>
        <h1 className="text-foreground mt-4 text-3xl font-semibold tracking-tight">
          Start with something you want to buy
        </h1>
        <p className="text-ink-muted mx-auto mt-4 max-w-2xl text-sm leading-7">
          Browse the storefront, add products from approved sellers, and come back here
          when you&apos;re ready to check out.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/products"
            className="bg-brand inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-white transition hover:bg-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            Shop products
          </Link>
          <Link
            href="/"
            className="border-border bg-panel-muted text-foreground inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-medium transition hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            Return home
          </Link>
        </div>
      </Container>
    </div>
  );
}
