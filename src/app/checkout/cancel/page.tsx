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

export default async function CheckoutCancelPage({
  searchParams,
}: CheckoutCancelPageProps) {
  const search = await searchParams;
  const orderId =
    typeof search.order_id === "string" ? search.order_id : null;

  return (
    <div className="py-12 md:py-16">
      <Container className="max-w-2xl space-y-8 text-center">
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
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6" />
              <path d="m9 9 6 6" />
            </svg>
          </div>

          <h1 className="text-foreground text-4xl font-semibold tracking-tight">
            Payment was not completed
          </h1>

          <p className="text-ink-muted mx-auto max-w-lg text-sm leading-7">
            You cancelled the payment or left the checkout page before
            completing the transaction. Your order has been saved and you can
            retry payment at any time from your order history.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {orderId ? (
            <Link
              href={`/orders/${orderId}`}
              className="bg-brand inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-white"
            >
              View order and retry payment
            </Link>
          ) : (
            <Link
              href="/orders"
              className="bg-brand inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-white"
            >
              View your orders
            </Link>
          )}
          <Link
            href="/cart"
            className="border-border bg-panel-muted text-foreground inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-medium"
          >
            Return to cart
          </Link>
          <Link
            href="/"
            className="border-border bg-panel-muted text-foreground inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-medium"
          >
            Continue shopping
          </Link>
        </div>
      </Container>
    </div>
  );
}
