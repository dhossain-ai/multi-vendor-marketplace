import Link from "next/link";
import { Container } from "@/components/ui/container";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { formatPrice } from "@/features/catalog/lib/format-price";
import type { CustomerOrderDetail } from "@/features/orders/types";

type OrderDetailViewProps = {
  order: CustomerOrderDetail;
  notice?: string | null;
};

export function OrderDetailView({ order, notice }: OrderDetailViewProps) {
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
              Pending-order detail
            </h1>
            <p className="text-ink-muted max-w-3xl text-sm leading-7">
              This page intentionally renders from order snapshots, so it remains
              historically stable even if product or seller data changes later.
            </p>
          </div>
          {notice ? <AuthMessage tone="success" message={notice} /> : null}
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
              <div className="space-y-2">
                <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
                  Order status
                </p>
                <h2 className="text-foreground text-2xl font-semibold tracking-tight">
                  {order.orderStatus} / {order.paymentStatus}
                </h2>
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

              <p className="text-ink-muted text-sm leading-7">
                Payment is intentionally still out of scope. This order is stored as
                a pending unpaid record so the next phase can attach a real payment
                session without rewriting checkout foundations.
              </p>

              <div className="flex flex-col gap-3">
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
