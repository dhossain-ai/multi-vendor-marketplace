import Link from "next/link";
import { Container } from "@/components/ui/container";
import { StatusBadge } from "@/components/ui/status-badge";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { formatPrice } from "@/features/catalog/lib/format-price";
import { ProductVisual } from "@/features/catalog/components/product-visual";
import { CartSubmitButton } from "@/features/cart/components/cart-submit-button";
import { startPaymentAction } from "@/features/checkout/lib/checkout-actions";
import {
  getCustomerFulfillmentStatusLabel,
  getCustomerOperationalStageLabel,
  getCustomerPaymentStatusLabel,
} from "@/features/orders/lib/order-status-copy";
import {
  getOperationalStageTone,
  getOrderOperationalStageDescription,
} from "@/features/orders/lib/order-progress";
import type { CustomerOrderDetail } from "@/features/orders/types";

type OrderDetailViewProps = {
  order: CustomerOrderDetail;
  notice?: string | null;
  error?: string | null;
};

type BadgeTone = Parameters<typeof StatusBadge>[0]["tone"];

const mapOrderTone = (
  tone: ReturnType<typeof getOperationalStageTone>,
): BadgeTone => (tone === "neutral" ? "neutral" : tone);

const canRetryPayment = (order: CustomerOrderDetail): boolean =>
  order.orderStatus === "pending" &&
  (order.paymentStatus === "unpaid" || order.paymentStatus === "failed");

const formatAddressLine = (parts: Array<string | null>) =>
  parts.filter(Boolean).join(", ");

export function OrderDetailView({ order, notice, error }: OrderDetailViewProps) {
  return (
    <div className="py-12 md:py-16">
      <Container className="space-y-8">
        <div className="space-y-4">
          <Link
            href="/orders"
            className="text-ink-muted text-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            Back to orders
          </Link>
          <div className="space-y-3">
            <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
              {order.orderNumber}
            </p>
            <h1 className="text-foreground text-4xl font-semibold tracking-tight">
              Order details
            </h1>
            <p className="text-ink-muted max-w-3xl text-sm leading-7">
              Review your items, totals, payment progress, and shipping details for
              this order.
            </p>
          </div>
          {error ? <AuthMessage tone="error" message={error} /> : null}
          {notice && !error ? <AuthMessage tone="success" message={notice} /> : null}
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <section className="space-y-4">
            <div className="rounded-[1.75rem] border border-border bg-panel p-5 shadow-[var(--shadow-panel)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
                    Order progress
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                    {getCustomerOperationalStageLabel(order.operationalStage)}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">
                    {getOrderOperationalStageDescription(order.operationalStage)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge
                    label={getCustomerOperationalStageLabel(order.operationalStage)}
                    tone={mapOrderTone(getOperationalStageTone(order.operationalStage))}
                  />
                  <StatusBadge
                    label={getCustomerPaymentStatusLabel(order.paymentStatus)}
                    tone={
                      order.paymentStatus === "paid"
                        ? "success"
                        : order.paymentStatus === "processing"
                          ? "info"
                          : order.paymentStatus === "failed"
                            ? "danger"
                            : "warning"
                    }
                  />
                </div>
              </div>
            </div>

            {order.items.map((item) => (
              <article
                key={item.id}
                className="border-border bg-panel rounded-[1.75rem] border p-4 shadow-[var(--shadow-panel)] sm:p-5"
              >
                <div className="grid gap-5 md:grid-cols-[9rem_1fr]">
                  <ProductVisual
                    title={item.productTitle}
                    imageUrl={item.metadata.thumbnailUrl ?? null}
                    categoryName={item.metadata.categoryName ?? null}
                    className="aspect-[4/3] h-auto min-h-36"
                  />
                  <div className="space-y-4">
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
                        <StatusBadge
                          label={getCustomerFulfillmentStatusLabel(item.fulfillmentStatus)}
                        />
                      </div>

                      <div className="rounded-[1.25rem] bg-panel-muted px-4 py-3 text-left md:min-w-40 md:text-right">
                        <p className="text-ink-muted text-sm">Line total</p>
                        <p className="text-foreground mt-1 text-xl font-semibold">
                          {formatPrice(item.lineTotalAmount, item.currencyCode)}
                        </p>
                        <p className="text-ink-muted mt-1 text-xs">
                          {formatPrice(item.unitPriceAmount, item.currencyCode)} each
                        </p>
                        {item.discountAmount > 0 ? (
                          <p className="mt-1 text-xs text-emerald-700">
                            {formatPrice(item.discountAmount, item.currencyCode)} saved
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="text-ink-muted flex flex-wrap items-center gap-3 border-t border-border pt-4 text-sm">
                      <span>Quantity: {item.quantity}</span>
                      <span>Ordered: {new Date(item.createdAt).toLocaleString()}</span>
                      {item.shippedAt ? (
                        <span>Shipped: {new Date(item.shippedAt).toLocaleString()}</span>
                      ) : null}
                      {item.deliveredAt ? (
                        <span>Delivered: {new Date(item.deliveredAt).toLocaleString()}</span>
                      ) : null}
                    </div>

                    {item.trackingCode || item.shipmentNote ? (
                      <div className="rounded-[1.25rem] bg-panel-muted px-4 py-3 text-sm leading-6 text-ink-muted">
                        {item.trackingCode ? (
                          <p className="break-words">
                            <span className="font-medium text-foreground">
                              Tracking:
                            </span>{" "}
                            {item.trackingCode}
                          </p>
                        ) : null}
                        {item.shipmentNote ? (
                          <p className={item.trackingCode ? "mt-2" : undefined}>
                            <span className="font-medium text-foreground">
                              Shipment note:
                            </span>{" "}
                            {item.shipmentNote}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="border-border bg-panel rounded-[2rem] border p-5 shadow-[var(--shadow-panel)] sm:p-6 xl:sticky xl:top-28 xl:self-start">
            <div className="space-y-5">
              <div className="space-y-3">
                <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
                  Order status
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    label={getCustomerOperationalStageLabel(order.operationalStage)}
                    tone={mapOrderTone(getOperationalStageTone(order.operationalStage))}
                  />
                  <StatusBadge
                    label={getCustomerPaymentStatusLabel(order.paymentStatus)}
                    tone={
                      order.paymentStatus === "paid"
                        ? "success"
                        : order.paymentStatus === "processing"
                          ? "info"
                          : order.paymentStatus === "failed"
                            ? "danger"
                            : "warning"
                    }
                  />
                </div>
                <p className="text-sm leading-6 text-ink-muted">
                  {getOrderOperationalStageDescription(order.operationalStage)}
                </p>
                <p className="text-xs leading-5 text-ink-muted">
                  Order placed {new Date(order.placedAt ?? order.createdAt).toLocaleString()}
                </p>
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
                  <span className="text-ink-muted">Savings</span>
                  <span className="text-foreground font-medium">
                    -{formatPrice(order.discountAmount, order.currencyCode)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink-muted">Tax</span>
                  <span className="text-foreground font-medium">
                    {formatPrice(order.taxAmount, order.currencyCode)}
                  </span>
                </div>
                <div className="rounded-[1.25rem] bg-brand-soft px-4 py-3">
                  <div className="flex items-center justify-between gap-3 text-base">
                    <span className="text-foreground font-medium">Total</span>
                    <span className="text-foreground text-xl font-semibold">
                      {formatPrice(order.totalAmount, order.currencyCode)}
                    </span>
                  </div>
                </div>
              </div>

              <section className="rounded-[1.5rem] bg-white/80 px-4 py-3 text-sm leading-6">
                <p className="text-foreground font-medium">Shipping address</p>
                {order.shippingAddress ? (
                  <div className="text-ink-muted mt-2 space-y-1">
                    <p className="text-foreground">
                      {order.shippingAddress.recipientName}
                    </p>
                    <p>{order.shippingAddress.line1}</p>
                    {order.shippingAddress.line2 ? (
                      <p>{order.shippingAddress.line2}</p>
                    ) : null}
                    <p>
                      {formatAddressLine([
                        order.shippingAddress.city,
                        order.shippingAddress.stateRegion,
                        order.shippingAddress.postalCode,
                      ])}
                    </p>
                    <p>{order.shippingAddress.countryCode}</p>
                    {order.shippingAddress.phone ? (
                      <p>{order.shippingAddress.phone}</p>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-ink-muted mt-2">
                    This older order does not include a saved shipping address.
                  </p>
                )}
              </section>

              {order.paymentStatus === "paid" ? (
                <div className="rounded-[1.5rem] bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
                  <p className="font-medium">
                    {getCustomerOperationalStageLabel(order.operationalStage)}
                  </p>
                  <p className="mt-1">
                    {getOrderOperationalStageDescription(order.operationalStage)}
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
                      className="bg-brand inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 text-sm font-semibold text-white transition hover:bg-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </form>
                ) : null}

                <Link
                  href="/orders"
                  className="border-border bg-panel-muted text-foreground inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-medium transition hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  View all orders
                </Link>
                <Link
                  href="/products"
                  className="bg-brand inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-white transition hover:bg-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  Continue shopping
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
