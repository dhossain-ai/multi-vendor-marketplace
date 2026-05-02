import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";

type CheckoutCancelPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Payment Cancelled",
  description: "Your payment was not completed.",
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function CheckoutCancelPage({
  searchParams,
}: CheckoutCancelPageProps) {
  const search = await searchParams;
  const orderId =
    typeof search.order_id === "string" && UUID_PATTERN.test(search.order_id)
      ? search.order_id
      : null;

  return (
    <div className="py-12 md:py-16">
      <Container className="max-w-2xl">
        <div className="border-border bg-panel space-y-8 rounded-[2rem] border p-6 text-center shadow-[var(--shadow-panel)] sm:p-8">
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-amber-600"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6" />
                <path d="m9 9 6 6" />
              </svg>
            </div>

            <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
              Checkout paused
            </p>
            <h1 className="text-foreground text-4xl font-semibold tracking-tight">
              Payment was not completed
            </h1>

            <p className="text-ink-muted mx-auto max-w-lg text-sm leading-7">
              You cancelled payment or left the checkout page before finishing.
              If an order was created, you can retry payment from the order page.
            </p>
          </div>

          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap">
            {orderId ? (
              <Link
                href={`/orders/${orderId}`}
                className="bg-brand inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-white transition hover:bg-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                View order and retry payment
              </Link>
            ) : (
              <Link
                href="/orders"
                className="bg-brand inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-white transition hover:bg-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                View your orders
              </Link>
            )}
            <Link
              href="/cart"
              className="border-border bg-panel-muted text-foreground inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-medium transition hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              Return to cart
            </Link>
            <Link
              href="/products"
              className="border-border bg-panel-muted text-foreground inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-medium transition hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              Continue shopping
            </Link>
          </div>

          <div className="rounded-[1.5rem] border border-border bg-amber-50/70 px-5 py-4 text-left text-sm leading-6 text-amber-900">
            <p className="font-medium">Nothing was confirmed from this page</p>
            <p className="mt-1">
              Your order status and payment status remain visible in order history.
              Complete a payment only from checkout or an eligible order page.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
