import Link from "next/link";
import { Container } from "@/components/ui/container";

export function CartEmptyState() {
  return (
    <div className="py-16">
      <Container className="border-border bg-panel rounded-[2rem] border p-10 text-center shadow-[var(--shadow-panel)]">
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
        <Link
          href="/"
          className="bg-brand mt-8 inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-white"
        >
          Browse products
        </Link>
      </Container>
    </div>
  );
}
