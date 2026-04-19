import Link from "next/link";
import { formatPrice } from "@/features/catalog/lib/format-price";
import { CartSubmitButton } from "@/features/cart/components/cart-submit-button";
import { clearCartAction } from "@/features/cart/lib/cart-actions";
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
            Provisional totals before checkout
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
        </div>

        <p className="text-ink-muted text-sm leading-7">
          Checkout is not implemented yet. Final pricing, availability, and any
          discount logic will be revalidated on the server during the next phase.
        </p>

        {cart.hasUnavailableItems ? (
          <p className="rounded-[1.5rem] bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-700">
            One or more items are no longer fully purchasable. Remove or adjust
            them before checkout is introduced.
          </p>
        ) : null}

        <div className="flex flex-col gap-3">
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
