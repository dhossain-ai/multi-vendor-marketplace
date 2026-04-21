"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthenticatedUser } from "@/lib/auth/guards";
import { sanitizeRedirectPath } from "@/lib/auth/navigation";
import {
  addItemToCart,
  applyCouponToCart,
  CartOperationError,
  clearCartByUserId,
  removeCouponFromCart,
  removeCartItem,
  updateCartItemQuantity,
} from "@/features/cart/lib/cart-repository";

const buildCartPath = (params?: { notice?: string; error?: string }) => {
  const searchParams = new URLSearchParams();

  if (params?.notice) {
    searchParams.set("notice", params.notice);
  }

  if (params?.error) {
    searchParams.set("error", params.error);
  }

  const query = searchParams.toString();

  return query ? `/cart?${query}` : "/cart";
};

const buildPagePath = (path: string, params?: { notice?: string; error?: string }) => {
  const searchParams = new URLSearchParams();

  if (params?.notice) {
    searchParams.set("notice", params.notice);
  }

  if (params?.error) {
    searchParams.set("error", params.error);
  }

  const query = searchParams.toString();

  return query ? `${path}?${query}` : path;
};

const revalidateCartSurface = (nextPath?: string) => {
  revalidatePath("/cart");
  revalidatePath("/", "layout");

  if (nextPath) {
    revalidatePath(nextPath);
  }
};

const getFriendlyMessage = (error: unknown, fallback: string) =>
  error instanceof CartOperationError ? error.message : fallback;

export async function addToCartAction(formData: FormData) {
  const nextPath = sanitizeRedirectPath(formData.get("nextPath"));
  const productId = String(formData.get("productId") ?? "").trim();
  const quantity = Number(formData.get("quantity") ?? 1);
  const session = await requireAuthenticatedUser(nextPath);

  if (!productId) {
    redirect(
      buildPagePath(nextPath, {
        error: "A product id is required before an item can be added to the cart.",
      }),
    );
  }

  try {
    const result = await addItemToCart({
      userId: session.user.id,
      productId,
      quantity,
    });

    revalidateCartSurface(nextPath);
    redirect(
      buildCartPath({
        notice: `${result.product.title} was added to your cart.`,
      }),
    );
  } catch (error) {
    redirect(
      buildPagePath(nextPath, {
        error: getFriendlyMessage(
          error,
          "The cart could not be updated for that product.",
        ),
      }),
    );
  }
}

export async function updateCartQuantityAction(formData: FormData) {
  const cartItemId = String(formData.get("cartItemId") ?? "").trim();
  const quantity = Number(formData.get("quantity") ?? 1);
  const session = await requireAuthenticatedUser("/cart");

  if (!cartItemId) {
    redirect(
      buildCartPath({
        error: "A cart item id is required before quantity can be updated.",
      }),
    );
  }

  try {
    await updateCartItemQuantity({
      userId: session.user.id,
      cartItemId,
      quantity,
    });

    revalidateCartSurface("/cart");
    redirect(
      buildCartPath({
        notice: "Cart quantity updated.",
      }),
    );
  } catch (error) {
    redirect(
      buildCartPath({
        error: getFriendlyMessage(error, "The cart quantity could not be updated."),
      }),
    );
  }
}

export async function removeCartItemAction(formData: FormData) {
  const cartItemId = String(formData.get("cartItemId") ?? "").trim();
  const session = await requireAuthenticatedUser("/cart");

  if (!cartItemId) {
    redirect(
      buildCartPath({
        error: "A cart item id is required before an item can be removed.",
      }),
    );
  }

  try {
    await removeCartItem({
      userId: session.user.id,
      cartItemId,
    });

    revalidateCartSurface("/cart");
    redirect(
      buildCartPath({
        notice: "Item removed from cart.",
      }),
    );
  } catch (error) {
    redirect(
      buildCartPath({
        error: getFriendlyMessage(error, "The cart item could not be removed."),
      }),
    );
  }
}

export async function clearCartAction() {
  const session = await requireAuthenticatedUser("/cart");

  try {
    await clearCartByUserId(session.user.id);
    revalidateCartSurface("/cart");
    redirect(
      buildCartPath({
        notice: "Cart cleared.",
      }),
    );
  } catch (error) {
    redirect(
      buildCartPath({
        error: getFriendlyMessage(error, "The cart could not be cleared."),
      }),
    );
  }
}

export async function applyCartCouponAction(formData: FormData) {
  const session = await requireAuthenticatedUser("/cart");
  const code = String(formData.get("code") ?? "").trim();

  if (!code) {
    redirect(
      buildCartPath({
        error: "Enter a coupon code before applying it.",
      }),
    );
  }

  try {
    const coupon = await applyCouponToCart({
      userId: session.user.id,
      code,
    });

    revalidateCartSurface("/cart");
    revalidatePath("/checkout");
    redirect(
      buildCartPath({
        notice: `${coupon.code} was applied to your cart.`,
      }),
    );
  } catch (error) {
    redirect(
      buildCartPath({
        error: getFriendlyMessage(error, "That coupon could not be applied."),
      }),
    );
  }
}

export async function removeCartCouponAction() {
  const session = await requireAuthenticatedUser("/cart");

  try {
    await removeCouponFromCart(session.user.id);
    revalidateCartSurface("/cart");
    revalidatePath("/checkout");
    redirect(
      buildCartPath({
        notice: "Coupon removed from cart.",
      }),
    );
  } catch (error) {
    redirect(
      buildCartPath({
        error: getFriendlyMessage(error, "The coupon could not be removed."),
      }),
    );
  }
}
