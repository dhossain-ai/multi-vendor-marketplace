import Link from "next/link";
import { Container } from "@/components/ui/container";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { ProductVisual } from "@/features/catalog/components/product-visual";
import { formatPrice } from "@/features/catalog/lib/format-price";
import { CartSubmitButton } from "@/features/cart/components/cart-submit-button";
import { submitCheckoutAction } from "@/features/checkout/lib/checkout-actions";
import type { CustomerAddress } from "@/features/account/types";
import type { CheckoutValidationResult } from "@/features/checkout/types";

type CheckoutViewProps = {
  checkout: CheckoutValidationResult;
  addresses: CustomerAddress[];
  error?: string | null;
  notice?: string | null;
};

export function CheckoutView({
  checkout,
  addresses,
  error,
  notice,
}: CheckoutViewProps) {
  const messageTone =
    error != null ? "error" : notice != null ? "success" : null;
  const selectedAddress =
    addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;
  const canSubmitCheckout = checkout.canSubmit && addresses.length > 0;

  return (
    <div className="py-12 md:py-16">
      <Container className="space-y-8">
        <div className="space-y-4">
          <div className="space-y-3">
            <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
              Checkout
            </p>
            <h1 className="text-foreground text-4xl font-semibold tracking-tight">
              Review and place your order
            </h1>
            <p className="text-ink-muted max-w-3xl text-sm leading-7">
              Check your items, confirm the total, and continue to secure payment
              when everything looks right.
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
              Your cart is empty
            </h2>
            <p className="text-ink-muted mx-auto mt-4 max-w-2xl text-sm leading-7">
              Add a few products first, then come back here to finish your order.
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
                Browse products
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
                          <p className="text-ink-muted text-sm">
                            {item.discountAmount > 0 ? "Line total" : "Line subtotal"}
                          </p>
                          <p className="text-foreground mt-1 text-xl font-semibold">
                            {formatPrice(
                              item.discountAmount > 0
                                ? item.lineTotalAmount
                                : item.lineSubtotalAmount,
                              item.currencyCode,
                            )}
                          </p>
                          <p className="text-ink-muted mt-1 text-xs">
                            {formatPrice(item.unitPriceAmount, item.currencyCode)} each
                          </p>
                          {item.discountAmount > 0 ? (
                            <p className="mt-1 text-xs text-emerald-700">
                              Includes {formatPrice(item.discountAmount, item.currencyCode)} in savings
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="text-ink-muted flex flex-wrap items-center gap-4 text-sm">
                        <span>Quantity: {item.quantity}</span>
                        <span>Sold by {item.seller.name}</span>
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

            <aside className="border-border bg-panel rounded-[2rem] border p-5 shadow-[var(--shadow-panel)] sm:p-6 xl:sticky xl:top-28 xl:self-start">
              <div className="space-y-5">
                <div className="space-y-2">
                  <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
                    Order summary
                  </p>
                  <h2 className="text-foreground text-2xl font-semibold tracking-tight">
                    Estimated total
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
                      -{formatPrice(
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

                {checkout.appliedCoupon?.isValid ? (
                  <div className="rounded-[1.5rem] bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
                    <p className="font-medium">{checkout.appliedCoupon.code} applied</p>
                    <p className="mt-1">{checkout.appliedCoupon.message}</p>
                  </div>
                ) : null}

                <section className="rounded-[1.5rem] bg-white/80 px-4 py-3 text-sm leading-6">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-foreground font-medium">
                        Shipping address
                      </p>
                      <p className="text-ink-muted mt-1">
                        Choose a saved address before payment.
                      </p>
                    </div>
                    <Link
                      href="/account/addresses"
                      className="text-brand shrink-0 font-medium"
                    >
                      Manage
                    </Link>
                  </div>

                  {addresses.length > 0 ? (
                    <div className="space-y-2">
                      {addresses.map((address) => (
                        <label
                          key={address.id}
                          className="border-border flex gap-3 rounded-2xl border bg-panel px-3 py-3 transition has-[:checked]:border-brand has-[:checked]:bg-brand-soft/40"
                        >
                          <input
                            form="checkout-submit-form"
                            type="radio"
                            name="shippingAddressId"
                            value={address.id}
                            defaultChecked={address.id === selectedAddress?.id}
                            className="mt-1 size-4"
                          />
                          <span>
                            <span className="text-foreground block font-medium">
                              {address.label ?? address.recipientName}
                              {address.isDefault ? " (default)" : ""}
                            </span>
                            <span className="text-ink-muted block">
                              {address.recipientName}
                            </span>
                            <span className="text-ink-muted block">
                              {[address.line1, address.line2]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                            <span className="text-ink-muted block">
                              {[
                                address.city,
                                address.stateRegion,
                                address.postalCode,
                                address.countryCode,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-amber-50 px-4 py-3 text-amber-800">
                      <p className="font-medium">Shipping address required</p>
                      <p className="mt-1">
                        Add a saved shipping address before continuing to payment.
                      </p>
                    </div>
                  )}
                </section>

                <p className="text-ink-muted text-sm leading-7">
                  We save your order details first, then send you to Stripe for secure
                  payment. Your order is confirmed after the payment provider verifies the transaction.
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
                  {canSubmitCheckout ? (
                    <form id="checkout-submit-form" action={submitCheckoutAction}>
                      <CartSubmitButton
                        idleLabel="Proceed to payment"
                        pendingLabel="Redirecting to Stripe..."
                        className="bg-brand inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </form>
                  ) : (
                    <span className="border-border bg-panel-muted text-ink-muted inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-center text-sm font-medium">
                      {addresses.length === 0
                        ? "Add a shipping address before checkout"
                        : "Resolve cart issues before checkout"}
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
