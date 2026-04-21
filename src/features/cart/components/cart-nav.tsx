import Link from "next/link";
import { getAuthSessionState } from "@/lib/auth/session";
import { getCartItemCountByUserId } from "@/features/cart/lib/cart-repository";

const getErrorReason = (error: unknown) => {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const code =
      "code" in error && typeof error.code === "string" ? error.code : null;
    const message =
      "message" in error && typeof error.message === "string"
        ? error.message
        : null;

    if (code && message) {
      return `${code}: ${message}`;
    }

    if (message) {
      return message;
    }
  }

  return "Unknown cart loading error";
};

export async function CartNav() {
  const session = await getAuthSessionState();

  if (!session.user) {
    return (
      <Link
        href="/sign-in?next=%2Fcart"
        className="inline-flex min-h-10 items-center justify-center rounded-full border border-border bg-panel px-4 text-sm font-medium text-foreground"
      >
        Cart
      </Link>
    );
  }

  let itemCount = 0;

  try {
    itemCount = await getCartItemCountByUserId(session.user.id);
  } catch (error) {
    console.warn("Cart count fallback in header:", getErrorReason(error));
  }

  return (
    <Link
      href="/cart"
      className="inline-flex min-h-10 items-center justify-center rounded-full border border-border bg-panel px-4 text-sm font-medium text-foreground"
    >
      {itemCount > 0 ? `Cart (${itemCount})` : "Cart"}
    </Link>
  );
}
