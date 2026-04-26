import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { getAuthSessionState } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Sell on Northstar Market",
  description: "Learn how to apply for seller access on the marketplace.",
};

export default async function SellPage() {
  const session = await getAuthSessionState();
  const isApprovedSeller =
    session.profile?.role === "seller" && session.sellerProfile?.status === "approved";
  const ctaHref = isApprovedSeller ? "/seller" : "/seller/register";
  const ctaLabel = isApprovedSeller ? "Open seller dashboard" : "Start seller application";

  return (
    <div className="py-16 md:py-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
          <section className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
              Sell on Northstar Market
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Apply to open your store on the marketplace
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-ink-muted">
              Sellers are reviewed before they can publish products or fulfill marketplace orders. Create an account, submit your store details, and the marketplace team will review your application.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={ctaHref}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white"
              >
                {ctaLabel}
              </Link>
              <Link
                href="/"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-panel px-6 text-sm font-medium text-foreground"
              >
                Browse marketplace
              </Link>
            </div>
          </section>

          <aside className="rounded-[2rem] border border-border bg-panel p-6 shadow-[var(--shadow-panel)]">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
              Application steps
            </p>
            <ol className="mt-4 space-y-3 text-sm leading-7 text-ink-muted">
              <li>1. Sign in or create a customer account.</li>
              <li>2. Submit store, support, and country details.</li>
              <li>3. Wait for admin review and approval.</li>
              <li>4. Add products after seller access is approved.</li>
            </ol>
          </aside>
        </div>
      </Container>
    </div>
  );
}
