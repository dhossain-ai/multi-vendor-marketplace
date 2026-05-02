import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";

type CheckoutSuccessPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Order Received",
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
        <div className="border-border bg-panel space-y-8 rounded-[2rem] border p-6 text-center shadow-[var(--shadow-panel)] sm:p-8">
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
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>

            <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
              Order received
            </p>
            <h1 className="text-foreground text-4xl font-semibold tracking-tight">
              Payment is being confirmed
            </h1>

            <p className="text-ink-muted mx-auto max-w-lg text-sm leading-7">
              We received your order and payment information. Your order will update
              once the payment provider verifies the transaction.
            </p>

            {sessionId ? (
              <p className="text-ink-muted break-words text-xs">
                Session reference:{" "}
                <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">
                  {sessionId.slice(0, 24)}...
                </code>
              </p>
            ) : null}
          </div>

          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row">
            <Link
              href="/orders"
              className="bg-brand inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-white transition hover:bg-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              View your orders
            </Link>
            <Link
              href="/products"
              className="border-border bg-panel-muted text-foreground inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-medium transition hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              Continue shopping
            </Link>
          </div>

          <div className="border-border rounded-[1.5rem] border bg-emerald-50/60 px-5 py-4 text-left text-sm leading-6 text-emerald-900">
            <p className="font-medium">What happens next</p>
            <p className="mt-1">
              Your order history will show the latest payment and fulfillment status.
              If confirmation is still pending after a short wait, refresh your orders page.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
