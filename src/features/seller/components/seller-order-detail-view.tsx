import Link from "next/link";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { formatPrice } from "@/features/catalog/lib/format-price";
import {
  getFulfillmentStatusLabel,
  getOperationalStageTone,
  getOrderOperationalStageDescription,
  getOrderOperationalStageLabel,
} from "@/features/orders/lib/order-progress";
import { updateSellerOrderFulfillmentAction } from "@/features/seller/lib/seller-actions";
import type { SellerOrderDetail } from "@/features/seller/types";

type SellerOrderDetailViewProps = {
  order: SellerOrderDetail;
  notice?: string | null;
  error?: string | null;
};

const getStatusColor = (tone: ReturnType<typeof getOperationalStageTone>) => {
  switch (tone) {
    case "success":
      return "bg-emerald-100 text-emerald-800";
    case "info":
      return "bg-blue-100 text-blue-800";
    case "warning":
      return "bg-amber-100 text-amber-800";
    case "danger":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getFulfillmentTone = (status: SellerOrderDetail["items"][number]["fulfillmentStatus"]) => {
  switch (status) {
    case "delivered":
      return "success";
    case "processing":
    case "shipped":
      return "info";
    case "cancelled":
      return "danger";
    default:
      return "warning";
  }
};

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: ReturnType<typeof getOperationalStageTone>;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(tone)}`}
    >
      {label}
    </span>
  );
}

export function SellerOrderDetailView({
  order,
  notice,
  error,
}: SellerOrderDetailViewProps) {
  const canMoveToProcessing = order.operationalStage === "confirmed";
  const canMoveToShipped =
    order.operationalStage === "confirmed" || order.operationalStage === "processing";
  const canMoveToDelivered = order.operationalStage === "shipped";

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Link href="/seller/orders" className="text-sm text-ink-muted hover:text-foreground">
          Back to seller orders
        </Link>
        <div className="space-y-3">
          <p className="text-sm font-semibold tracking-[0.16em] text-brand uppercase">
            {order.orderNumber}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            Fulfillment details
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-ink-muted">
            Keep this order moving with clear customer-facing updates. Payment
            status stays read-only here, while fulfillment updates apply only to
            your store&apos;s items.
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
              className="rounded-[1.75rem] border border-border bg-panel p-5 shadow-[var(--shadow-panel)]"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge
                      label={getFulfillmentStatusLabel(item.fulfillmentStatus)}
                      tone={getFulfillmentTone(item.fulfillmentStatus)}
                    />
                    {item.metadata.categoryName ? (
                      <span className="text-xs font-semibold tracking-[0.12em] text-brand uppercase">
                        {String(item.metadata.categoryName)}
                      </span>
                    ) : null}
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    {item.productTitle}
                  </h2>
                  {item.productSlug ? (
                    <p className="text-sm text-ink-muted">/{item.productSlug}</p>
                  ) : null}
                </div>

                <div className="text-left md:text-right">
                  <p className="text-sm text-ink-muted">Line total</p>
                  <p className="mt-1 text-xl font-semibold text-foreground">
                    {formatPrice(item.lineTotalAmount, item.currencyCode)}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted">
                    {formatPrice(item.unitPriceAmount, item.currencyCode)} x {item.quantity}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-ink-muted">
                <span>Quantity: {item.quantity}</span>
                {item.trackingCode ? <span>Tracking: {item.trackingCode}</span> : null}
                {item.shippedAt ? (
                  <span>Shipped: {new Date(item.shippedAt).toLocaleString()}</span>
                ) : null}
                {item.deliveredAt ? (
                  <span>Delivered: {new Date(item.deliveredAt).toLocaleString()}</span>
                ) : null}
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
                  Current stage
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    label={getOrderOperationalStageLabel(order.operationalStage)}
                    tone={getOperationalStageTone(order.operationalStage)}
                  />
                  <StatusBadge
                    label={order.paymentStatus.replace(/_/g, " ")}
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
              </div>

              <div className="space-y-3 border-y border-border py-5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink-muted">Customer</span>
                  <span className="text-right font-medium text-foreground">
                    {order.customerName ?? "Customer"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink-muted">Items</span>
                  <span className="font-medium text-foreground">{order.itemCount}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink-muted">Store total</span>
                  <span className="font-medium text-foreground">
                    {formatPrice(order.grossSalesAmount, order.currencyCode)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink-muted">Placed</span>
                  <span className="text-right font-medium text-foreground">
                    {new Date(order.placedAt ?? order.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {order.paymentStatus !== "paid" ? (
                <div className="rounded-[1.5rem] bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                  <p className="font-medium">Waiting on payment</p>
                  <p className="mt-1">
                    Fulfillment updates unlock after the customer&apos;s payment is
                    confirmed.
                  </p>
                </div>
              ) : null}

              <div className="space-y-3">
                {canMoveToProcessing ? (
                  <form action={updateSellerOrderFulfillmentAction}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <input type="hidden" name="fulfillmentStatus" value="processing" />
                    <button
                      type="submit"
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-white"
                    >
                      Mark as processing
                    </button>
                  </form>
                ) : null}

                {canMoveToShipped ? (
                  <form
                    action={updateSellerOrderFulfillmentAction}
                    className="space-y-3 rounded-[1.5rem] border border-border bg-panel-muted p-4"
                  >
                    <input type="hidden" name="orderId" value={order.id} />
                    <input type="hidden" name="fulfillmentStatus" value="shipped" />
                    <div className="space-y-2">
                      <label
                        htmlFor="trackingCode"
                        className="text-sm font-medium text-foreground"
                      >
                        Tracking code
                      </label>
                      <input
                        id="trackingCode"
                        name="trackingCode"
                        type="text"
                        placeholder="Optional tracking code"
                        className="w-full rounded-xl border border-border bg-panel px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-brand"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="shipmentNote"
                        className="text-sm font-medium text-foreground"
                      >
                        Shipment note
                      </label>
                      <textarea
                        id="shipmentNote"
                        name="shipmentNote"
                        rows={3}
                        placeholder="Optional note for the customer"
                        className="w-full rounded-xl border border-border bg-panel px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-brand"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-border px-5 text-sm font-medium text-foreground"
                    >
                      Mark as shipped
                    </button>
                  </form>
                ) : null}

                {canMoveToDelivered ? (
                  <form action={updateSellerOrderFulfillmentAction}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <input type="hidden" name="fulfillmentStatus" value="delivered" />
                    <button
                      type="submit"
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-border px-5 text-sm font-medium text-foreground"
                    >
                      Mark as delivered
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
