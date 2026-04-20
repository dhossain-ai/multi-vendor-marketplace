import { formatPrice } from "@/features/catalog/lib/format-price";
import type { SellerOrderItem } from "@/features/seller/types";

type SellerOrdersViewProps = {
  orders: SellerOrderItem[];
};

const getStatusColor = (status: string): string => {
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

export function SellerOrdersView({ orders }: SellerOrdersViewProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
          Your orders
        </p>
        <h1 className="text-foreground text-4xl font-semibold tracking-tight">
          Seller order history
        </h1>
        <p className="text-ink-muted max-w-3xl text-sm leading-7">
          These are line items from customer orders that contain your products.
          You only see items belonging to your store — other sellers&apos; items
          are not shown.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="border-border bg-panel rounded-[2rem] border p-10 text-center shadow-[var(--shadow-panel)]">
          <h2 className="text-foreground text-3xl font-semibold tracking-tight">
            No orders yet
          </h2>
          <p className="text-ink-muted mx-auto mt-4 max-w-2xl text-sm leading-7">
            Orders for your products will appear here once customers purchase
            from your store.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((item) => (
            <div
              key={item.id}
              className="border-border bg-panel rounded-[1.75rem] border p-5 shadow-[var(--shadow-panel)]"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-brand text-xs font-semibold tracking-[0.12em] uppercase">
                      {item.orderNumber}
                    </span>
                    <StatusBadge label={item.orderStatus} />
                    <StatusBadge label={item.paymentStatus} />
                  </div>
                  <h2 className="text-foreground text-xl font-semibold tracking-tight">
                    {item.productTitle}
                  </h2>
                  {item.productSlug ? (
                    <p className="text-ink-muted text-xs">
                      Snapshot slug: {item.productSlug}
                    </p>
                  ) : null}
                </div>

                <div className="text-right">
                  <p className="text-ink-muted text-sm">Line total</p>
                  <p className="text-foreground mt-1 text-xl font-semibold">
                    {formatPrice(item.lineTotalAmount, item.currencyCode)}
                  </p>
                  <p className="text-ink-muted mt-1 text-xs">
                    {formatPrice(item.unitPriceAmount, item.currencyCode)} ×{" "}
                    {item.quantity}
                  </p>
                </div>
              </div>

              <div className="text-ink-muted mt-3 flex flex-wrap items-center gap-4 text-xs">
                <span>Qty: {item.quantity}</span>
                {item.orderPlacedAt ? (
                  <span>
                    Placed: {new Date(item.orderPlacedAt).toLocaleString()}
                  </span>
                ) : (
                  <span>
                    Created: {new Date(item.createdAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
