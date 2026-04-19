"use client";

import { addToCartAction } from "@/features/cart/lib/cart-actions";
import { CartSubmitButton } from "@/features/cart/components/cart-submit-button";

type AddToCartFormProps = {
  productId: string;
  nextPath: string;
};

export function AddToCartForm({ productId, nextPath }: AddToCartFormProps) {
  return (
    <form action={addToCartAction} className="space-y-3">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value="1" />
      <input type="hidden" name="nextPath" value={nextPath} />
      <CartSubmitButton
        idleLabel="Add to cart"
        pendingLabel="Adding..."
        className="bg-brand inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      />
      <p className="text-ink-muted text-xs leading-6">
        Cart totals stay provisional until checkout revalidates the latest product data.
      </p>
    </form>
  );
}
