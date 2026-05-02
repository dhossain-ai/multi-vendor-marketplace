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
              Confirm your order
            </h1>
            <p className="text-ink-muted max-w-3xl text-sm leading-7">
              Review your cart, choose a saved shipping address, and continue to secure
              payment when everything looks right.
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
            <section className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["1", "Review items", `${checkout.totals.itemCount} item${checkout.totals.itemCount === 1 ? "" : "s"}`],
                  ["2", "Shipping address", addresses.length > 0 ? "Saved address selected" : "Address required"],
                  ["3", "Secure payment", "Redirects after review"],
                ].map(([step, label, helper]) => (
                  <div
                    key={step}
                    className="rounded-[1.5rem] border border-border bg-panel px-4 py-3 text-sm shadow-[var(--shadow-panel)]"
                  >
                    <span className="inline-flex size-7 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
                      {step}
                    </span>
                    <p className="mt-3 font-medium text-foreground">{label}</p>
                    <p className="mt-1 text-ink-muted">{helper}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                {checkout.items.map((item) => (
                <article
                  key={item.cartItemId}
                  className="border-border bg-panel rounded-[1.75rem] border p-4 shadow-[var(--shadow-panel)] sm:p-5"
                >
                  <div className="grid gap-5 md:grid-cols-[9rem_1fr]">
                    <ProductVisual
                      title={item.title}
                      imageUrl={item.thumbnailUrl}
                      categoryName={item.category?.name}
                      className="aspect-[4/3] h-auto min-h-36"
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

                        <div className="rounded-[1.25rem] bg-panel-muted px-4 py-3 text-left md:min-w-40 md:text-right">
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
                            <p className="mt-1 text-xs leading-5 text-emerald-700">
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
              </div>
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
                    <span className="font-medium text-emerald-700">
                      {checkout.totals.discountAmount > 0
                        ? `-${formatPrice(
                            checkout.totals.discountAmount,
                            checkout.totals.currencyCode,
                          )}`
                        : formatPrice(0, checkout.totals.currencyCode)}
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
                  <div className="rounded-[1.25rem] bg-brand-soft px-4 py-3">
                    <div className="flex items-center justify-between gap-3 text-base">
                      <span className="text-foreground font-medium">Total</span>
                      <span className="text-foreground text-xl font-semibold">
                        {formatPrice(
                          checkout.totals.totalAmount,
                          checkout.totals.currencyCode,
                        )}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-ink-muted">
                      This total is recalculated on the server before payment begins.
                    </p>
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
                        Choose where this order should ship.
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
                          className="border-border flex cursor-pointer gap-3 rounded-2xl border bg-panel px-3 py-3 transition has-[:checked]:border-brand has-[:checked]:bg-brand-soft/40 hover:border-foreground/25"
                        >
                          <input
                            form="checkout-submit-form"
                            type="radio"
                            name="shippingAddressId"
                            value={address.id}
                            defaultChecked={address.id === selectedAddress?.id}
                            className="mt-1 size-4 accent-brand"
                          />
                          <span>
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="text-foreground block font-medium">
                                {address.label ?? address.recipientName}
                              </span>
                              {address.isDefault ? (
                                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                  Default
                                </span>
                              ) : null}
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

                <div className="rounded-[1.5rem] border border-border bg-panel-muted px-4 py-3 text-sm leading-6 text-ink-muted">
                  <p className="font-medium text-foreground">Secure payment</p>
                  <p className="mt-1">
                    We save your order details first, then send you to Stripe.
                    Your order is confirmed after payment is verified.
                  </p>
                </div>

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
                        className="bg-brand inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 text-sm font-semibold text-white transition hover:bg-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-60"
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
                    className="border-border bg-panel-muted text-foreground inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-medium transition hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
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
