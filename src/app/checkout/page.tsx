import type { Metadata } from "next";
import { CheckoutView } from "@/features/checkout/components/checkout-view";
import { validateCheckout } from "@/features/checkout/lib/checkout-service";
import { readSearchParam } from "@/lib/auth/navigation";
import { requireAuthenticatedUser } from "@/lib/auth/guards";

type CheckoutPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Checkout",
  description: "Validate the cart and create a pending order before payment integration.",
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const search = await searchParams;
  const session = await requireAuthenticatedUser("/checkout");
  const checkout = await validateCheckout(session.user.id);

  return (
    <CheckoutView
      checkout={checkout}
      error={readSearchParam(search.error)}
      notice={readSearchParam(search.notice)}
    />
  );
}
