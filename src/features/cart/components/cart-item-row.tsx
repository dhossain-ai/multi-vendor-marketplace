import Link from "next/link";
import { ProductVisual } from "@/features/catalog/components/product-visual";
import { formatPrice } from "@/features/catalog/lib/format-price";
import { CartSubmitButton } from "@/features/cart/components/cart-submit-button";
import { removeCartItemAction, updateCartQuantityAction } from "@/features/cart/lib/cart-actions";
import type { CartItem } from "@/features/cart/types";

type CartItemRowProps = {
  item: CartItem;
};

export function CartItemRow({ item }: CartItemRowProps) {
  const availabilityTone =
    item.availability === "available"
      ? "text-emerald-700"
      : "text-amber-700";

  return (
    <article className="border-border bg-panel rounded-[1.75rem] border p-5 shadow-[var(--shadow-panel)]">
      <div className="grid gap-5 md:grid-cols-[10rem_1fr]">
        <ProductVisual
          title={item.title}
          imageUrl={item.thumbnailUrl}
          className="h-40"
        />

        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {item.category ? (
                  <span className="text-brand font-semibold tracking-[0.12em] uppercase">
                    {item.category.name}
                  </span>
                ) : null}
                {item.seller ? (
                  <span className="text-ink-muted">Sold by {item.seller.name}</span>
                ) : null}
              </div>

              <Link
                href={`/products/${item.productSlug}`}
                className="text-foreground text-2xl font-semibold tracking-tight hover:underline"
              >
                {item.title}
              </Link>

              <p className={`text-sm font-medium ${availabilityTone}`}>
                {item.availabilityLabel}
              </p>
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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <form action={updateCartQuantityAction} className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="cartItemId" value={item.id} />
              <label className="space-y-2">
                <span className="text-ink-muted block text-sm">Quantity</span>
                <input
                  type="number"
                  name="quantity"
                  min={1}
                  max={99}
                  defaultValue={item.quantity}
                  className="border-border bg-white text-foreground h-11 w-24 rounded-full border px-4 text-sm outline-none transition focus:border-foreground"
                />
              </label>
              <CartSubmitButton
                idleLabel="Update"
                pendingLabel="Saving..."
                className="border-border bg-panel-muted text-foreground inline-flex min-h-11 items-center justify-center rounded-full border px-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
              />
            </form>

            <form action={removeCartItemAction}>
              <input type="hidden" name="cartItemId" value={item.id} />
              <CartSubmitButton
                idleLabel="Remove"
                pendingLabel="Removing..."
                className="text-ink-muted inline-flex min-h-11 items-center justify-center rounded-full px-2 text-sm font-medium underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
              />
            </form>
          </div>
        </div>
      </div>
    </article>
  );
}
