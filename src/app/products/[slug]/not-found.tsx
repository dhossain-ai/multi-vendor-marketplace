import Link from "next/link";
import { Container } from "@/components/ui/container";

export default function ProductNotFound() {
  return (
    <div className="py-20">
      <Container className="border-border bg-panel rounded-[2rem] border p-10 text-center shadow-[var(--shadow-panel)]">
        <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
          Product unavailable
        </p>
        <h1 className="text-foreground mt-3 text-3xl font-semibold tracking-tight">
          This product is not available in the public catalog.
        </h1>
        <p className="text-ink-muted mx-auto mt-4 max-w-2xl text-sm leading-7">
          The slug may be incorrect, the product may no longer be publicly
          visible, or it may still be in a non-public state such as draft or
          suspension.
        </p>
        <Link
          href="/"
          className="bg-brand mt-6 inline-flex rounded-full px-5 py-3 text-sm font-medium text-white"
        >
          Back to catalog
        </Link>
      </Container>
    </div>
  );
}
