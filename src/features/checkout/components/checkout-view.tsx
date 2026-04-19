import Link from "next/link";
import { Container } from "@/components/ui/container";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { ProductVisual } from "@/features/catalog/components/product-visual";
import { formatPrice } from "@/features/catalog/lib/format-price";
import { CartSubmitButton } from "@/features/cart/components/cart-submit-button";
import { submitCheckoutAction } from "@/features/checkout/lib/checkout-actions";
import type { CheckoutValidationResult } from "@/features/checkout/types";

type CheckoutViewProps = {
  checkout: CheckoutValidationResult;
  error?: string | null;
  notice?: string | null;
};

export function CheckoutView({ checkout, error, notice }: CheckoutViewProps) {
  const messageTone =
    error != null ? "error" : notice != null ? "success" : null;

  return (
    <div className="py-12 md:py-16">
      <Container className="space-y-8">
        <div className="space-y-4">
          <div className="space-y-3">
            <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
              Checkout
            </p>
            <h1 className="text-foreground text-4xl font-semibold tracking-tight">
              Validate cart items before payment
            </h1>
            <p className="text-ink-muted max-w-3xl text-sm leading-7">
              This phase creates a snapshot-backed pending order with server-side
              totals. Payment provider integration still arrives in the next phase.
            </p>
          </div>
          {messageTone && error ? (
            <AuthMessage tone="error" message={error} />
          ) : null}
          {messageTone && !error && notice ? (
            <AuthMessage tone="success" message={notice} />
          ) : null}
        </div>

        {checkout.status === "empty" ? (
          <section className="border-border bg-panel rounded-[2rem] border p-10 text-center shadow-[var(--shadow-panel)]">
            <h2 className="text-foreground text-3xl font-semibold tracking-tight">
              There is nothing to check out yet
            </h2>
            <p className="text-ink-muted mx-auto mt-4 max-w-2xl text-sm leading-7">
              Your cart is empty, so checkout cannot create a pending order.
              Add items from the catalog first.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/cart"
                className="border-border bg-panel-muted text-foreground inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-medium"
              >
                Open cart
              </Link>
              <Link
                href="/"
                className="bg-brand inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-white"
              >
                Browse catalog
              </Link>
            </div>
          </section>
        ) : (
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
            <section className="space-y-4">
              {checkout.items.map((item) => (
                <article
                  key={item.cartItemId}
                  className="border-border bg-panel rounded-[1.75rem] border p-5 shadow-[var(--shadow-panel)]"
                >
                  <div className="grid gap-5 md:grid-cols-[9rem_1fr]">
                    <ProductVisual
                      title={item.title}
                      imageUrl={item.thumbnailUrl}
                      className="h-36"
                    />
                    <div className="space-y-3">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            {item.category ? (
                              <span className="text-brand font-semibold tracking-[0.12em] uppercase">
                                {item.category.name}
                              </span>
                            ) : null}
                            <span className="text-ink-muted">
                              Sold by {item.seller.name}
                            </span>
                          </div>
                          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
                            {item.title}
                          </h2>
                          <p
                            className={`text-sm font-medium ${
                              item.status === "ready"
                                ? "text-emerald-700"
                                : "text-amber-700"
                            }`}
                          >
                            {item.availabilityLabel}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-ink-muted text-sm">Line subtotal</p>
                          <p className="text-foreground mt-1 text-xl font-semibold">
                            {formatPrice(
                              item.lineSubtotalAmount,
                              item.currencyCode,
                            )}
                          </p>
                          <p className="text-ink-muted mt-1 text-xs">
                            {formatPrice(item.unitPriceAmount, item.currencyCode)} each
                          </p>
                        </div>
                      </div>

                      <div className="text-ink-muted flex flex-wrap items-center gap-4 text-sm">
                        <span>Quantity: {item.quantity}</span>
                        <span>Slug: {item.productSlug}</span>
                      </div>

                      {item.issues.length > 0 ? (
                        <ul className="rounded-[1.5rem] bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-700">
                          {item.issues.map((issue) => (
                            <li key={`${item.cartItemId}-${issue}`}>{issue}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <aside className="border-border bg-panel rounded-[2rem] border p-6 shadow-[var(--shadow-panel)]">
              <div className="space-y-5">
                <div className="space-y-2">
                  <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
                    Order summary
                  </p>
                  <h2 className="text-foreground text-2xl font-semibold tracking-tight">
                    Server-calculated pending order totals
                  </h2>
                </div>

                <div className="border-border space-y-3 border-y py-5 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-ink-muted">Items</span>
                    <span className="text-foreground font-medium">
                      {checkout.totals.itemCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-ink-muted">Subtotal</span>
                    <span className="text-foreground font-medium">
                      {formatPrice(
                        checkout.totals.subtotalAmount,
                        checkout.totals.currencyCode,
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-ink-muted">Discounts</span>
                    <span className="text-foreground font-medium">
                      {formatPrice(
                        checkout.totals.discountAmount,
                        checkout.totals.currencyCode,
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-ink-muted">Tax</span>
                    <span className="text-foreground font-medium">
                      {formatPrice(
                        checkout.totals.taxAmount,
                        checkout.totals.currencyCode,
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-base">
                    <span className="text-foreground font-medium">Total</span>
                    <span className="text-foreground text-xl font-semibold">
                      {formatPrice(
                        checkout.totals.totalAmount,
                        checkout.totals.currencyCode,
                      )}
                    </span>
                  </div>
                </div>

                <p className="text-ink-muted text-sm leading-7">
                  Checkout creates a pending order and snapshot-backed order items.
                  Payment remains out of scope for this phase, so the new order will
                  stay in an unpaid pending state.
                </p>

                {checkout.errors.length > 0 ? (
                  <div className="rounded-[1.5rem] bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-700">
                    <p className="font-medium">Checkout is blocked</p>
                    <ul className="mt-2 space-y-1">
                      {checkout.errors.map((issue) => (
                        <li key={issue}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="flex flex-col gap-3">
                  {checkout.canSubmit ? (
                    <form action={submitCheckoutAction}>
                      <CartSubmitButton
                        idleLabel="Create pending order"
                        pendingLabel="Creating..."
                        className="bg-brand inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </form>
                  ) : (
                    <span className="border-border bg-panel-muted text-ink-muted inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-medium">
                      Resolve cart issues before checkout
                    </span>
                  )}

                  <Link
                    href="/cart"
                    className="border-border bg-panel-muted text-foreground inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-medium"
                  >
                    Return to cart
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        )}
      </Container>
    </div>
  );
}
