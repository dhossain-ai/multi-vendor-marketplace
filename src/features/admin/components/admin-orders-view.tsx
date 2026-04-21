import Link from "next/link";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { formatPrice } from "@/features/catalog/lib/format-price";
import { AdminStatusBadge } from "@/features/admin/components/admin-status-badge";
import { getOrderOperationalStageLabel } from "@/features/orders/lib/order-progress";
import type {
  AdminOrderStatus,
  AdminOrderSummary,
  AdminPaymentStatus,
} from "@/features/admin/types";

type AdminOrdersViewProps = {
  orders: AdminOrderSummary[];
  currentOrderStatus: AdminOrderStatus | null;
  currentPaymentStatus: AdminPaymentStatus | null;
  notice?: string | null;
  error?: string | null;
};

export function AdminOrdersView({
  orders,
  currentOrderStatus,
  currentPaymentStatus,
  notice,
  error,
}: AdminOrdersViewProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold tracking-[0.16em] text-brand uppercase">
          Marketplace orders
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          Orders
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-ink-muted">
          Review order and payment health across the marketplace. This stays read-only
          for now so operational visibility stays clear without adding manual support tools too early.
        </p>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3 rounded-[1.75rem] border border-border bg-panel p-5 shadow-[var(--shadow-panel)]">
        <div className="space-y-2">
          <label htmlFor="orderStatus" className="text-sm font-medium text-foreground">
            Order status
          </label>
          <select
            id="orderStatus"
            name="orderStatus"
            defaultValue={currentOrderStatus ?? ""}
            className="block min-w-48 rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
          >
            <option value="">All order statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
            <option value="partially_refunded">Partially refunded</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="paymentStatus" className="text-sm font-medium text-foreground">
            Payment status
          </label>
          <select
            id="paymentStatus"
            name="paymentStatus"
            defaultValue={currentPaymentStatus ?? ""}
            className="block min-w-48 rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
          >
            <option value="">All payment statuses</option>
            <option value="unpaid">Unpaid</option>
            <option value="processing">Processing</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
            <option value="partially_refunded">Partially refunded</option>
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-white"
        >
          Apply filter
        </button>
      </form>

      {error ? <AuthMessage tone="error" message={error} /> : null}
      {notice && !error ? <AuthMessage tone="success" message={notice} /> : null}

      {orders.length === 0 ? (
        <div className="rounded-[2rem] border border-border bg-panel p-10 text-center shadow-[var(--shadow-panel)]">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            No orders found
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-ink-muted">
            No platform orders match the selected filters.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="block rounded-[1.75rem] border border-border bg-panel p-5 shadow-[var(--shadow-panel)] transition hover:border-foreground/25"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold tracking-[0.12em] text-brand uppercase">
                      {order.orderNumber}
                    </span>
                    <AdminStatusBadge
                      label={getOrderOperationalStageLabel(order.operationalStage)}
                    />
                    <AdminStatusBadge label={order.paymentStatus} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                      {order.customerName ?? order.customerEmail ?? order.customerId}
                    </h2>
                    <p className="mt-1 text-sm text-ink-muted">
                      {order.customerEmail ?? "No customer email recorded"}
                    </p>
                  </div>
                </div>

                <div className="text-left xl:text-right">
                  <p className="text-sm text-ink-muted">Order total</p>
                  <p className="mt-1 text-xl font-semibold text-foreground">
                    {formatPrice(order.totalAmount, order.currencyCode)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-ink-muted">
                <span>Items: {order.itemCount}</span>
                <span>Sellers: {order.sellerCount}</span>
                <span>Stage: {getOrderOperationalStageLabel(order.operationalStage)}</span>
                <span>
                  Created: {new Date(order.createdAt).toLocaleString()}
                </span>
                {order.placedAt ? (
                  <span>Placed: {new Date(order.placedAt).toLocaleString()}</span>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
