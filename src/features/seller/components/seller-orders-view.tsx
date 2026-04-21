import Link from "next/link";
import { formatPrice } from "@/features/catalog/lib/format-price";
import {
  getOperationalStageTone,
  getOrderOperationalStageLabel,
} from "@/features/orders/lib/order-progress";
import type { SellerOrderSummary } from "@/features/seller/types";

type SellerOrdersViewProps = {
  orders: SellerOrderSummary[];
};

const getStatusColor = (tone: ReturnType<typeof getOperationalStageTone>): string => {
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
      {label.replace(/_/g, " ")}
    </span>
  );
}

export function SellerOrdersView({ orders }: SellerOrdersViewProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
          Store orders
        </p>
        <h1 className="text-foreground text-4xl font-semibold tracking-tight">
          Fulfillment
        </h1>
        <p className="text-ink-muted max-w-3xl text-sm leading-7">
          Review the orders that include your products, move paid orders through
          fulfillment, and keep shipment updates customer-friendly.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="border-border bg-panel rounded-[2rem] border p-10 text-center shadow-[var(--shadow-panel)]">
          <h2 className="text-foreground text-3xl font-semibold tracking-tight">
            No sales yet
          </h2>
          <p className="text-ink-muted mx-auto mt-4 max-w-2xl text-sm leading-7">
            Paid orders for your products will appear here once customers begin
            purchasing from your store.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/seller/orders/${order.id}`}
              className="border-border bg-panel block rounded-[1.75rem] border p-5 shadow-[var(--shadow-panel)] transition hover:border-foreground/25"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-brand text-xs font-semibold tracking-[0.12em] uppercase">
                      {order.orderNumber}
                    </span>
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
                  <h2 className="text-foreground text-xl font-semibold tracking-tight">
                    {order.itemCount} item{order.itemCount === 1 ? "" : "s"} from your store
                  </h2>
                  <p className="text-ink-muted text-xs">
                    {order.totalQuantity} unit{order.totalQuantity === 1 ? "" : "s"} across this order
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-ink-muted text-sm">Store total</p>
                  <p className="text-foreground mt-1 text-xl font-semibold">
                    {formatPrice(order.grossSalesAmount, order.currencyCode)}
                  </p>
                  <p className="text-ink-muted mt-1 text-xs">Open order details</p>
                </div>
              </div>

              <div className="text-ink-muted mt-3 flex flex-wrap items-center gap-4 text-xs">
                <span>
                  Stage: {getOrderOperationalStageLabel(order.operationalStage)}
                </span>
                {order.placedAt ? (
                  <span>
                    Placed: {new Date(order.placedAt).toLocaleString()}
                  </span>
                ) : (
                  <span>
                    Created: {new Date(order.createdAt).toLocaleString()}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
