import type { Metadata } from "next";
import { CheckoutView } from "@/features/checkout/components/checkout-view";
import { listAddressesForUser } from "@/features/account/lib/address-repository";
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
  let addresses: CustomerAddress[] = [];

  try {
    addresses = await listAddressesForUser(session.user.id);
  } catch {
    addresses = [];
  }

  return (
    <CheckoutView
      checkout={checkout}
      addresses={addresses}
      error={readSearchParam(search.error)}
      notice={readSearchParam(search.notice)}
    />
  );
}
