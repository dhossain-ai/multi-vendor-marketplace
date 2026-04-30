import Link from "next/link";
import { Container } from "@/components/ui/container";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatPrice } from "@/features/catalog/lib/format-price";
import { OrdersEmptyState } from "@/features/orders/components/orders-empty-state";
import {
  getCustomerOperationalStageLabel,
  getCustomerPaymentStatusLabel,
} from "@/features/orders/lib/order-status-copy";
import type { CustomerOrderSummary } from "@/features/orders/types";

type OrdersListViewProps = {
  orders: CustomerOrderSummary[];
  notice?: string | null;
};

export function OrdersListView({ orders, notice }: OrdersListViewProps) {
  if (orders.length === 0) {
    return (
      <>
        <section className="py-12">
          <Container className="space-y-4">
            <div>
              <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
                Your orders
              </p>
              <h1 className="text-foreground mt-2 text-4xl font-semibold tracking-tight">
                Order history
              </h1>
            </div>
            {notice ? <AuthMessage tone="success" message={notice} /> : null}
          </Container>
        </section>
        <OrdersEmptyState />
      </>
    );
  }

  return (
    <div className="py-12 md:py-16">
      <Container className="space-y-8">
        <div className="space-y-4">
          <div className="space-y-3">
            <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
              Your orders
            </p>
            <h1 className="text-foreground text-4xl font-semibold tracking-tight">
              Track recent purchases
            </h1>
            <p className="text-ink-muted max-w-3xl text-sm leading-7">
              Follow payment progress, open any order for details, and keep a clear
              record of what you&apos;ve purchased.
            </p>
          </div>
          {notice ? <AuthMessage tone="success" message={notice} /> : null}
        </div>

        <section className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="border-border bg-panel block rounded-[1.75rem] border p-6 shadow-[var(--shadow-panel)] transition hover:border-foreground/25"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <p className="text-brand text-sm font-semibold tracking-[0.12em] uppercase">
                    {order.orderNumber}
                  </p>
                  <h2 className="text-foreground text-2xl font-semibold tracking-tight">
                    {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <StatusBadge
                      label={getCustomerOperationalStageLabel(order.operationalStage)}
                    />
                    <StatusBadge
                      label={getCustomerPaymentStatusLabel(order.paymentStatus)}
                    />
                    <span className="text-ink-muted">
                      {new Date(order.placedAt ?? order.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-ink-muted text-sm">Order total</p>
                  <p className="text-foreground mt-1 text-2xl font-semibold">
                    {formatPrice(order.totalAmount, order.currencyCode)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </section>
      </Container>
    </div>
  );
}
