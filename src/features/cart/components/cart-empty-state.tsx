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
          Start with a product from the public catalog
        </h1>
        <p className="text-ink-muted mx-auto mt-4 max-w-2xl text-sm leading-7">
          The cart is now wired for authenticated customers, but it only fills from
          real add-to-cart actions. Browse the catalog and add a product when you
          are ready.
        </p>
        <Link
          href="/"
          className="bg-brand mt-8 inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-white"
        >
          Browse catalog
        </Link>
      </Container>
    </div>
  );
}
