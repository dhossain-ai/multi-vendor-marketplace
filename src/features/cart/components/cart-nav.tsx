import Link from "next/link";
import { getAuthSessionState } from "@/lib/auth/session";
import { getCartItemCountByUserId } from "@/features/cart/lib/cart-repository";

export async function CartNav() {
  const session = await getAuthSessionState();

  if (!session.user) {
    return (
      <Link
        href="/sign-in?next=%2Fcart"
        className="border-border bg-panel text-ink-muted rounded-full border px-4 py-2 text-sm"
      >
        Cart
      </Link>
    );
  }

  const itemCount = await getCartItemCountByUserId(session.user.id);

  return (
    <Link
      href="/cart"
      className="border-border bg-panel text-foreground rounded-full border px-4 py-2 text-sm font-medium"
    >
      {itemCount > 0 ? `Cart (${itemCount})` : "Cart"}
    </Link>
  );
}
