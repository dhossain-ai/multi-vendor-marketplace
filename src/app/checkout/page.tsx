import type { Metadata } from "next";
import { CheckoutView } from "@/features/checkout/components/checkout-view";
import { getDefaultAddressForUser } from "@/features/account/lib/address-repository";
import { validateCheckout } from "@/features/checkout/lib/checkout-service";
import { readSearchParam } from "@/lib/auth/navigation";
import { requireAuthenticatedUser } from "@/lib/auth/guards";
import type { CustomerAddress } from "@/features/account/types";

type CheckoutPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Checkout",
  description: "Review your cart and continue to secure payment.",
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const search = await searchParams;
  const session = await requireAuthenticatedUser("/checkout");
  const checkout = await validateCheckout(session.user.id);
  let defaultAddress: CustomerAddress | null = null;

  try {
    defaultAddress = await getDefaultAddressForUser(session.user.id);
  } catch {
    defaultAddress = null;
  }

  return (
    <CheckoutView
      checkout={checkout}
      defaultAddress={defaultAddress}
      error={readSearchParam(search.error)}
      notice={readSearchParam(search.notice)}
    />
  );
}
