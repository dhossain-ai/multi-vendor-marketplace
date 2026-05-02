import Link from "next/link";
import { cn } from "@/lib/utils/cn";
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

type CartNavProps = {
  compact?: boolean;
};

const cartLinkClass = (compact: boolean) =>
  cn(
    "inline-flex min-h-10 items-center justify-center rounded-full border border-border bg-panel text-sm font-medium text-foreground transition hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
    compact ? "min-w-14 px-3" : "px-4",
  );

export async function CartNav({ compact = false }: CartNavProps) {
  const session = await getAuthSessionState();

  if (!session.user) {
    return (
      <Link
        href="/sign-in?next=%2Fcart"
        className={cartLinkClass(compact)}
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
      className={cartLinkClass(compact)}
    >
      {itemCount > 0 ? `Cart (${itemCount})` : "Cart"}
    </Link>
  );
}
