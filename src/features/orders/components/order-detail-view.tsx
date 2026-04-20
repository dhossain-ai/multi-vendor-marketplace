import Link from "next/link";
import { Container } from "@/components/ui/container";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { formatPrice } from "@/features/catalog/lib/format-price";
import { CartSubmitButton } from "@/features/cart/components/cart-submit-button";
import { startPaymentAction } from "@/features/checkout/lib/checkout-actions";
import type { CustomerOrderDetail } from "@/features/orders/types";

type OrderDetailViewProps = {
  order: CustomerOrderDetail;
  notice?: string | null;
  error?: string | null;
};

const getStatusColor = (
  status: string,
): string => {
  switch (status) {
    case "paid":
    case "confirmed":
    case "completed":
      return "bg-emerald-100 text-emerald-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "unpaid":
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "failed":
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "refunded":
    case "partially_refunded":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

function StatusBadge({ label }: { label: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(label)}`}
    >
      {label.replace(/_/g, " ")}
    </span>
  );
}

const canRetryPayment = (order: CustomerOrderDetail): boolean =>
  order.orderStatus === "pending" &&
  (order.paymentStatus === "unpaid" || order.paymentStatus === "failed");

export function OrderDetailView({ order, notice, error }: OrderDetailViewProps) {
  return (
    <div className="py-12 md:py-16">
      <Container className="space-y-8">
        <div className="space-y-4">
          <Link href="/orders" className="text-ink-muted text-sm hover:text-foreground">
            Back to orders
          </Link>
          <div className="space-y-3">
            <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
              {order.orderNumber}
            </p>
            <h1 className="text-foreground text-4xl font-semibold tracking-tight">
              Order detail
            </h1>
            <p className="text-ink-muted max-w-3xl text-sm leading-7">
              This page renders from order snapshots, so it remains
              historically stable even if product or seller data changes later.
            </p>
          </div>
          {error ? <AuthMessage tone="error" message={error} /> : null}
          {notice && !error ? <AuthMessage tone="success" message={notice} /> : null}
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <section className="space-y-4">
            {order.items.map((item) => (
              <article
                key={item.id}
                className="border-border bg-panel rounded-[1.75rem] border p-5 shadow-[var(--shadow-panel)]"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      {item.metadata.categoryName ? (
                        <span className="text-brand font-semibold tracking-[0.12em] uppercase">
                          {item.metadata.categoryName}
                        </span>
                      ) : null}
                      {item.metadata.sellerName ? (
                        <span className="text-ink-muted">
                          Sold by {item.metadata.sellerName}
                        </span>
                      ) : null}
                    </div>
                    <h2 className="text-foreground text-2xl font-semibold tracking-tight">
                      {item.productTitle}
                    </h2>
                    {item.productSlug ? (
                      <p className="text-ink-muted text-sm">Snapshot slug: {item.productSlug}</p>
                    ) : null}
                  </div>

                  <div className="text-right">
                    <p className="text-ink-muted text-sm">Line total</p>
                    <p className="text-foreground mt-1 text-xl font-semibold">
                      {formatPrice(item.lineTotalAmount, item.currencyCode)}
                    </p>
                    <p className="text-ink-muted mt-1 text-xs">
                      {formatPrice(item.unitPriceAmount, item.currencyCode)} each
                    </p>
                  </div>
                </div>

                <div className="text-ink-muted mt-4 flex flex-wrap items-center gap-4 text-sm">
                  <span>Quantity: {item.quantity}</span>
                  <span>Seller id: {item.sellerId}</span>
                  <span>Created: {new Date(item.createdAt).toLocaleString()}</span>
                </div>
              </article>
            ))}
          </section>

          <aside className="border-border bg-panel rounded-[2rem] border p-6 shadow-[var(--shadow-panel)]">
            <div className="space-y-5">
              <div className="space-y-3">
                <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
                  Order status
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge label={order.orderStatus} />
                  <StatusBadge label={order.paymentStatus} />
                </div>
              </div>

              <div className="border-border space-y-3 border-y py-5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink-muted">Items</span>
                  <span className="text-foreground font-medium">{order.itemCount}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink-muted">Subtotal</span>
                  <span className="text-foreground font-medium">
                    {formatPrice(order.subtotalAmount, order.currencyCode)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink-muted">Discount</span>
                  <span className="text-foreground font-medium">
                    {formatPrice(order.discountAmount, order.currencyCode)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink-muted">Tax</span>
                  <span className="text-foreground font-medium">
                    {formatPrice(order.taxAmount, order.currencyCode)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 text-base">
                  <span className="text-foreground font-medium">Total</span>
                  <span className="text-foreground text-xl font-semibold">
                    {formatPrice(order.totalAmount, order.currencyCode)}
                  </span>
                </div>
              </div>

              {order.paymentStatus === "paid" ? (
                <div className="rounded-[1.5rem] bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
                  <p className="font-medium">Payment confirmed</p>
                  <p className="mt-1">
                    Your payment has been verified by the payment provider. This
                    order is confirmed and being processed.
                  </p>
                </div>
              ) : order.paymentStatus === "failed" ? (
                <div className="rounded-[1.5rem] bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
                  <p className="font-medium">Payment failed</p>
                  <p className="mt-1">
                    Your previous payment attempt was not successful. You can
                    retry payment below.
                  </p>
                </div>
              ) : order.paymentStatus === "unpaid" ? (
                <div className="rounded-[1.5rem] bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                  <p className="font-medium">Payment pending</p>
                  <p className="mt-1">
                    This order is awaiting payment. Complete your payment to
                    confirm the order.
                  </p>
                </div>
              ) : order.paymentStatus === "processing" ? (
                <div className="rounded-[1.5rem] bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800">
                  <p className="font-medium">Payment being verified</p>
                  <p className="mt-1">
                    Your payment is being verified by the payment provider. The
                    order will be confirmed shortly.
                  </p>
                </div>
              ) : null}

              <div className="flex flex-col gap-3">
                {canRetryPayment(order) ? (
                  <form
                    action={async () => {
                      "use server";
                      await startPaymentAction(order.id);
                    }}
                  >
                    <CartSubmitButton
                      idleLabel={
                        order.paymentStatus === "failed"
                          ? "Retry payment"
                          : "Pay now"
                      }
                      pendingLabel="Redirecting to Stripe..."
                      className="bg-brand inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </form>
                ) : null}

                <Link
                  href="/orders"
                  className="border-border bg-panel-muted text-foreground inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-medium"
                >
                  View all orders
                </Link>
                <Link
                  href="/"
                  className="bg-brand inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-white"
                >
                  Continue browsing
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
