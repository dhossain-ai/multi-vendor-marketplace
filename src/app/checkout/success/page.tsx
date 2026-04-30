import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";

type CheckoutSuccessPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Payment Received",
  description: "Your payment is being confirmed.",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const search = await searchParams;
  const sessionId =
    typeof search.session_id === "string" ? search.session_id : null;

  return (
    <div className="py-12 md:py-16">
      <Container className="max-w-2xl">
        <div className="border-border bg-panel space-y-8 rounded-[2rem] border p-8 text-center shadow-[var(--shadow-panel)]">
          <div className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-emerald-600"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>

          <h1 className="text-foreground text-4xl font-semibold tracking-tight">
            Your payment is being confirmed
          </h1>

          <p className="text-ink-muted mx-auto max-w-lg text-sm leading-7">
            We have received your payment information from Stripe. Your order
            will be confirmed shortly once the payment provider verifies the
            transaction. This usually takes just a few moments.
          </p>

          {sessionId ? (
            <p className="text-ink-muted text-xs">
              Session reference:{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">
                {sessionId.slice(0, 24)}…
              </code>
            </p>
          ) : null}
          </div>

          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row">
            <Link
              href="/orders"
              className="bg-brand inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-white"
            >
              View your orders
            </Link>
            <Link
              href="/products"
              className="border-border bg-panel-muted text-foreground inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-medium"
            >
              Continue shopping
            </Link>
          </div>

          <div className="border-border rounded-[1.5rem] border bg-amber-50/50 px-5 py-4 text-sm leading-6 text-amber-800">
            <p className="font-medium">Not seeing your order update?</p>
            <p className="mt-1">
              Payment confirmation depends on a provider callback. If your order
              still shows as &ldquo;pending&rdquo; after a minute, refresh your order
              history page. Contact support if the issue persists.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
