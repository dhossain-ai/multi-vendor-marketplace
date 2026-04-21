import Link from "next/link";
import { formatPrice } from "@/features/catalog/lib/format-price";
import { AdminStatusBadge } from "@/features/admin/components/admin-status-badge";
import {
  getFulfillmentStatusLabel,
  getOrderOperationalStageDescription,
  getOrderOperationalStageLabel,
} from "@/features/orders/lib/order-progress";
import type { AdminOrderDetail } from "@/features/admin/types";

type AdminOrderDetailViewProps = {
  order: AdminOrderDetail;
};

function JsonSnapshot({
  label,
  value,
}: {
  label: string;
  value: Record<string, unknown> | null;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="space-y-2 rounded-[1.5rem] border border-border bg-panel-muted p-4">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <pre className="overflow-x-auto text-xs leading-6 text-ink-muted">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

export function AdminOrderDetailView({ order }: AdminOrderDetailViewProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Link href="/admin/orders" className="text-sm text-ink-muted hover:text-foreground">
          Back to admin orders
        </Link>
        <div className="space-y-3">
          <p className="text-sm font-semibold tracking-[0.16em] text-brand uppercase">
            {order.orderNumber}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            Order details
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-ink-muted">
            Review the saved order details, line items, and payment attempts for this purchase.
            Manual refunds and overrides are intentionally out of scope for now.
          </p>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section className="space-y-4">
          {order.items.map((item) => (
            <article
              key={item.id}
              className="rounded-[1.75rem] border border-border bg-panel p-5 shadow-[var(--shadow-panel)]"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    {item.metadata.categoryName ? (
                      <span className="font-semibold tracking-[0.12em] text-brand uppercase">
                        {String(item.metadata.categoryName)}
                      </span>
                    ) : null}
                    {item.sellerName ? (
                      <span className="text-ink-muted">Seller: {item.sellerName}</span>
                    ) : null}
                    <AdminStatusBadge
                      label={getFulfillmentStatusLabel(item.fulfillmentStatus)}
                    />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    {item.productTitle}
                  </h2>
                  {item.productSlug ? (
                    <p className="text-sm text-ink-muted">Snapshot slug: {item.productSlug}</p>
                  ) : null}
                </div>

                <div className="text-left md:text-right">
                  <p className="text-sm text-ink-muted">Line total</p>
                  <p className="mt-1 text-xl font-semibold text-foreground">
                    {formatPrice(item.lineTotalAmount, item.currencyCode)}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted">
                    {formatPrice(item.unitPriceAmount, item.currencyCode)} × {item.quantity}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-ink-muted">
                <span>Seller id: {item.sellerId}</span>
                {item.productId ? <span>Product id: {item.productId}</span> : null}
                {item.trackingCode ? <span>Tracking: {item.trackingCode}</span> : null}
                {item.shippedAt ? (
                  <span>Shipped: {new Date(item.shippedAt).toLocaleString()}</span>
                ) : null}
                {item.deliveredAt ? (
                  <span>Delivered: {new Date(item.deliveredAt).toLocaleString()}</span>
                ) : null}
                <span>Created: {new Date(item.createdAt).toLocaleString()}</span>
              </div>
              {item.shipmentNote ? (
                <p className="mt-3 rounded-[1.25rem] bg-panel-muted px-4 py-3 text-sm leading-6 text-ink-muted">
                  {item.shipmentNote}
                </p>
              ) : null}
            </article>
          ))}
        </section>

        <aside className="space-y-4">
          <section className="rounded-[2rem] border border-border bg-panel p-6 shadow-[var(--shadow-panel)]">
            <div className="space-y-5">
              <div className="space-y-3">
                <p className="text-sm font-semibold tracking-[0.16em] text-brand uppercase">
                  Status
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <AdminStatusBadge
                    label={getOrderOperationalStageLabel(order.operationalStage)}
                  />
                  <AdminStatusBadge label={order.paymentStatus} />
                </div>
                <p className="text-sm leading-6 text-ink-muted">
                  {getOrderOperationalStageDescription(order.operationalStage)}
                </p>
              </div>

              <div className="space-y-3 border-y border-border py-5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink-muted">Customer</span>
                  <span className="text-right font-medium text-foreground">
                    {order.customerName ?? order.customerEmail ?? order.customerId}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink-muted">Subtotal</span>
                  <span className="font-medium text-foreground">
                    {formatPrice(order.subtotalAmount, order.currencyCode)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink-muted">Discount</span>
                  <span className="font-medium text-foreground">
                    {formatPrice(order.discountAmount, order.currencyCode)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink-muted">Tax</span>
                  <span className="font-medium text-foreground">
                    {formatPrice(order.taxAmount, order.currencyCode)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 text-base">
                  <span className="font-medium text-foreground">Total</span>
                  <span className="text-xl font-semibold text-foreground">
                    {formatPrice(order.totalAmount, order.currencyCode)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-ink-muted">
                <p>Created: {new Date(order.createdAt).toLocaleString()}</p>
                {order.placedAt ? (
                  <p>Placed: {new Date(order.placedAt).toLocaleString()}</p>
                ) : null}
                {order.couponId ? <p>Coupon id: {order.couponId}</p> : null}
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-border bg-panel p-6 shadow-[var(--shadow-panel)]">
            <div className="space-y-4">
              <p className="text-sm font-semibold tracking-[0.16em] text-brand uppercase">
                Payment attempts
              </p>
              {order.payments.length === 0 ? (
                <p className="text-sm text-ink-muted">No payment records found.</p>
              ) : (
                <div className="space-y-3">
                  {order.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="rounded-[1.5rem] border border-border bg-panel-muted p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <AdminStatusBadge label={payment.status} />
                        <span className="text-xs text-ink-muted">{payment.provider}</span>
                      </div>
                      <p className="mt-2 text-sm font-medium text-foreground">
                        {formatPrice(payment.amount, payment.currencyCode)}
                      </p>
                      <div className="mt-2 space-y-1 text-xs text-ink-muted">
                        {payment.providerSessionId ? (
                          <p>Session: {payment.providerSessionId}</p>
                        ) : null}
                        {payment.providerPaymentId ? (
                          <p>Payment id: {payment.providerPaymentId}</p>
                        ) : null}
                        <p>Created: {new Date(payment.createdAt).toLocaleString()}</p>
                        {payment.paidAt ? (
                          <p>Paid: {new Date(payment.paidAt).toLocaleString()}</p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <JsonSnapshot
            label="Shipping snapshot"
            value={
              order.shippingAddressSnapshot &&
              typeof order.shippingAddressSnapshot === "object" &&
              !Array.isArray(order.shippingAddressSnapshot)
                ? (order.shippingAddressSnapshot as Record<string, unknown>)
                : null
            }
          />
          <JsonSnapshot
            label="Billing snapshot"
            value={
              order.billingAddressSnapshot &&
              typeof order.billingAddressSnapshot === "object" &&
              !Array.isArray(order.billingAddressSnapshot)
                ? (order.billingAddressSnapshot as Record<string, unknown>)
                : null
            }
          />
        </aside>
      </div>
    </div>
  );
}
