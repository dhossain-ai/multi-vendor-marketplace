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
      ? "bg-emerald-50 text-emerald-800"
      : item.availability === "limited_stock"
        ? "bg-amber-50 text-amber-800"
        : "bg-red-50 text-red-800";

  return (
    <article className="border-border bg-panel rounded-[1.75rem] border p-4 shadow-[var(--shadow-panel)] transition hover:border-foreground/20 sm:p-5">
      <div className="grid gap-5 md:grid-cols-[11rem_1fr]">
        <ProductVisual
          title={item.title}
          imageUrl={item.thumbnailUrl}
          categoryName={item.category?.name}
          className="aspect-[4/3] h-auto min-h-40"
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
                className="text-foreground inline-flex text-2xl font-semibold tracking-tight underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {item.title}
              </Link>

              <p className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${availabilityTone}`}>
                {item.availabilityLabel}
              </p>
            </div>

            <div className="rounded-[1.25rem] bg-panel-muted px-4 py-3 text-left md:min-w-40 md:text-right">
              <p className="text-ink-muted text-sm">Line total</p>
              <p className="text-foreground mt-1 text-xl font-semibold">
                {formatPrice(item.lineTotalAmount, item.currencyCode)}
              </p>
              <p className="text-ink-muted mt-1 text-xs">
                {formatPrice(item.unitPriceAmount, item.currencyCode)} each
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-end sm:justify-between">
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
                  aria-label={`Quantity for ${item.title}`}
                  className="border-border bg-white text-foreground h-11 w-24 rounded-full border px-4 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </label>
              <CartSubmitButton
                idleLabel="Update"
                pendingLabel="Saving..."
                className="border-border bg-panel-muted text-foreground inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-medium transition hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-60"
              />
            </form>

            <form action={removeCartItemAction}>
              <input type="hidden" name="cartItemId" value={item.id} />
              <CartSubmitButton
                idleLabel="Remove"
                pendingLabel="Removing..."
                className="text-ink-muted inline-flex min-h-11 items-center justify-center rounded-full px-3 text-sm font-medium underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-60"
              />
            </form>
          </div>
        </div>
      </div>
    </article>
  );
}
