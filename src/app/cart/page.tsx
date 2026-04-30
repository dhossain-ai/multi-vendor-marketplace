import type { Metadata } from "next";
import { CartView } from "@/features/cart/components/cart-view";
import { getCartByUserId } from "@/features/cart/lib/cart-repository";
import { readSearchParam } from "@/lib/auth/navigation";
import { requireAuthenticatedUser } from "@/lib/auth/guards";

type CartPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your cart before checkout.",
};

export default async function CartPage({ searchParams }: CartPageProps) {
  const search = await searchParams;
  const session = await requireAuthenticatedUser("/cart");
  const cart = await getCartByUserId(session.user.id);

  return (
    <CartView
      cart={cart}
      notice={readSearchParam(search.notice)}
      error={readSearchParam(search.error)}
    />
  );
}
