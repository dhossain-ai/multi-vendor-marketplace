import Link from "next/link";
import { AddressCard } from "@/features/account/components/address-card";
import { AddressForm } from "@/features/account/components/address-form";
import { AuthMessage } from "@/features/auth/components/auth-message";
import type { CustomerAddress } from "@/features/account/types";

type AddressListViewProps = {
  addresses: CustomerAddress[];
  notice?: string | null;
  error?: string | null;
};

export function AddressListView({
  addresses,
  notice,
  error,
}: AddressListViewProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Link href="/account" className="text-brand text-sm font-medium">
          Back to account
        </Link>
        <div className="space-y-3">
          <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
            Address book
          </p>
          <h1 className="text-foreground text-4xl font-semibold tracking-tight">
            Shipping addresses
          </h1>
          <p className="text-ink-muted max-w-3xl text-sm leading-7">
            Save the places you ship to most often and choose a default for checkout.
          </p>
        </div>
        {error ? <AuthMessage tone="error" message={error} /> : null}
        {!error && notice ? <AuthMessage tone="success" message={notice} /> : null}
      </div>

      <section className="border-border bg-panel rounded-[2rem] border p-6 shadow-[var(--shadow-panel)]">
        <div className="mb-6 space-y-2">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
            Add a new address
          </h2>
          <p className="text-ink-muted text-sm leading-7">
            Your first saved address becomes the default automatically.
          </p>
        </div>
        <AddressForm mode="create" />
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
              Saved addresses
            </p>
            <h2 className="mt-2 text-foreground text-2xl font-semibold tracking-tight">
              {addresses.length === 0 ? "No addresses yet" : "Your address book"}
            </h2>
          </div>
        </div>

        {addresses.length === 0 ? (
          <div className="border-border bg-panel rounded-[2rem] border border-dashed p-8 text-center shadow-[var(--shadow-panel)]">
            <h3 className="text-foreground text-2xl font-semibold tracking-tight">
              Add your first shipping address
            </h3>
            <p className="text-ink-muted mx-auto mt-3 max-w-2xl text-sm leading-7">
              Use the form above to save an address. Checkout will automatically preselect your first saved address.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <AddressCard key={address.id} address={address} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
