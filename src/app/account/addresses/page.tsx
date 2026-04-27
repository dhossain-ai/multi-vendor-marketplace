import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { AddressListView } from "@/features/account/components/address-list-view";
import { listAddressesForUser } from "@/features/account/lib/address-repository";
import { readSearchParam } from "@/lib/auth/navigation";
import { requireAuthenticatedUser } from "@/lib/auth/guards";
import type { CustomerAddress } from "@/features/account/types";

type AccountAddressesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Address book",
  description: "Manage your saved marketplace shipping addresses.",
};

export default async function AccountAddressesPage({
  searchParams,
}: AccountAddressesPageProps) {
  const search = await searchParams;
  const session = await requireAuthenticatedUser("/account/addresses");
  let addresses: CustomerAddress[] = [];
  let loadError: string | null = null;

  try {
    addresses = await listAddressesForUser(session.user.id);
  } catch {
    loadError = "We could not load your address book. Please try again shortly.";
  }

  return (
    <div className="py-12 md:py-16">
      <Container>
        <AddressListView
          addresses={addresses}
          notice={readSearchParam(search.notice)}
          error={readSearchParam(search.error) ?? loadError}
        />
      </Container>
    </div>
  );
}
