import Link from "next/link";
import { Container } from "@/components/ui/container";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { formatPrice } from "@/features/catalog/lib/format-price";
import { OrdersEmptyState } from "@/features/orders/components/orders-empty-state";
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
                Customer orders
              </p>
              <h1 className="text-foreground mt-2 text-4xl font-semibold tracking-tight">
                Snapshot-backed order history
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
              Customer orders
            </p>
            <h1 className="text-foreground text-4xl font-semibold tracking-tight">
              Review pending and future orders
            </h1>
            <p className="text-ink-muted max-w-3xl text-sm leading-7">
              This order list is intentionally driven by order snapshots rather than
              live catalog records, so future product edits will not rewrite what
              the customer purchased.
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
                  <div className="text-ink-muted flex flex-wrap items-center gap-3 text-sm">
                    <span className="capitalize">Order: {order.orderStatus}</span>
                    <span className="capitalize">Payment: {order.paymentStatus}</span>
                    <span>
                      {new Date(order.placedAt ?? order.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-right">
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
