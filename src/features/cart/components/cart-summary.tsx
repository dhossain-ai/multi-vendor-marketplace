import Link from "next/link";
import { formatPrice } from "@/features/catalog/lib/format-price";
import { CartSubmitButton } from "@/features/cart/components/cart-submit-button";
import {
  applyCartCouponAction,
  clearCartAction,
  removeCartCouponAction,
} from "@/features/cart/lib/cart-actions";
import type { CartSnapshot } from "@/features/cart/types";

type CartSummaryProps = {
  cart: CartSnapshot;
};

export function CartSummary({ cart }: CartSummaryProps) {
  return (
    <aside className="border-border bg-panel rounded-[2rem] border p-5 shadow-[var(--shadow-panel)] sm:p-6">
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
            Cart summary
          </p>
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
            Estimated total
          </h2>
        </div>

        <div className="border-border space-y-3 border-y py-5 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-ink-muted">Item count</span>
            <span className="text-foreground font-medium">{cart.itemCount}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-ink-muted">Subtotal</span>
            <span className="text-foreground text-lg font-semibold">
              {formatPrice(cart.subtotalAmount, cart.currencyCode)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-ink-muted">Discount</span>
            <span className="font-medium text-emerald-700">
              {cart.discountAmount > 0
                ? `-${formatPrice(cart.discountAmount, cart.currencyCode)}`
                : formatPrice(0, cart.currencyCode)}
            </span>
          </div>
          <div className="rounded-[1.25rem] bg-brand-soft px-4 py-3">
            <div className="flex items-center justify-between gap-3 text-base">
              <span className="text-foreground font-medium">Estimated total</span>
              <span className="text-foreground text-xl font-semibold">
              {formatPrice(cart.totalAmount, cart.currencyCode)}
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-ink-muted">
              Final availability, coupon eligibility, and totals are checked again at checkout.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-[1.5rem] border border-border bg-panel-muted px-4 py-3 text-sm leading-6 text-ink-muted">
            <p className="font-medium text-foreground">Secure checkout</p>
            <p className="mt-1">
              Your order is reviewed on the server before payment begins.
            </p>
          </div>

          {cart.appliedCoupon ? (
            <div
              className={`rounded-[1.5rem] px-4 py-3 text-sm leading-6 ${
                cart.appliedCoupon.isValid
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-amber-50 text-amber-800"
              }`}
            >
              <p className="font-medium">
                {cart.appliedCoupon.isValid
                  ? `${cart.appliedCoupon.code} applied`
                  : `${cart.appliedCoupon.code} needs attention`}
              </p>
              <p className="mt-1">{cart.appliedCoupon.message}</p>
              <form action={removeCartCouponAction} className="mt-3">
                <CartSubmitButton
                  idleLabel="Remove coupon"
                  pendingLabel="Removing..."
                  className={`inline-flex min-h-10 w-full items-center justify-center rounded-full border px-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-60 ${
                    cart.appliedCoupon.isValid
                      ? "border-emerald-200 text-emerald-800"
                      : "border-amber-200 text-amber-800"
                  }`}
                />
              </form>
            </div>
          ) : (
            <form
              action={applyCartCouponAction}
              className="space-y-3 rounded-[1.5rem] border border-border bg-panel-muted p-4"
            >
              <div className="space-y-2">
                <label
                  htmlFor="coupon-code"
                  className="text-sm font-medium text-foreground"
                >
                  Coupon code
                </label>
                <input
                  id="coupon-code"
                  name="code"
                  type="text"
                  placeholder="Enter a code"
                  className="w-full rounded-xl border border-border bg-panel px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <CartSubmitButton
                idleLabel="Apply coupon"
                pendingLabel="Applying..."
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-border px-5 text-sm font-medium text-foreground transition hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-60"
              />
            </form>
          )}
        </div>

        {cart.hasUnavailableItems ? (
          <p className="rounded-[1.5rem] bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-700">
            One or more items need attention. Remove unavailable items or update
            limited quantities before checkout.
          </p>
        ) : null}

        <div className="flex flex-col gap-3">
          {cart.hasUnavailableItems ? (
            <span className="border-border bg-panel-muted text-ink-muted inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-medium">
              Resolve cart issues before checkout
            </span>
          ) : (
            <Link
              href="/checkout"
              className="bg-brand inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-white transition hover:bg-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              Continue to checkout
            </Link>
          )}
          <Link
            href="/products"
            className="border-border bg-panel-muted text-foreground inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-medium transition hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            Continue shopping
          </Link>
          <form action={clearCartAction}>
            <CartSubmitButton
              idleLabel="Clear cart"
              pendingLabel="Clearing..."
              className="text-ink-muted inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 text-sm font-medium underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-60"
            />
          </form>
        </div>
      </div>
    </aside>
  );
}
