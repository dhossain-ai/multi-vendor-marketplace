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
    <aside className="border-border bg-panel rounded-[2rem] border p-6 shadow-[var(--shadow-panel)]">
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
            <span className="text-foreground font-medium">
              -{formatPrice(cart.discountAmount, cart.currencyCode)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 text-base">
            <span className="text-foreground font-medium">Estimated total</span>
            <span className="text-foreground text-xl font-semibold">
              {formatPrice(cart.totalAmount, cart.currencyCode)}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-ink-muted text-sm leading-7">
            Taxes, discounts, and item availability are confirmed again at checkout
            before payment begins.
          </p>

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
                  className={`inline-flex min-h-10 w-full items-center justify-center rounded-full border px-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60 ${
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
                  className="w-full rounded-xl border border-border bg-panel px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-brand"
                />
              </div>
              <CartSubmitButton
                idleLabel="Apply coupon"
                pendingLabel="Applying..."
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-border px-5 text-sm font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-60"
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
              className="bg-brand inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-white"
            >
              Continue to checkout
            </Link>
          )}
          <Link
            href="/"
            className="border-border bg-panel-muted text-foreground inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-medium"
          >
            Continue shopping
          </Link>
          <form action={clearCartAction}>
            <CartSubmitButton
              idleLabel="Clear cart"
              pendingLabel="Clearing..."
              className="text-ink-muted inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 text-sm font-medium underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
            />
          </form>
        </div>
      </div>
    </aside>
  );
}
