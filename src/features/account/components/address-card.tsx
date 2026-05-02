import { AddressForm } from "@/features/account/components/address-form";
import {
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/features/account/lib/account-actions";
import type { CustomerAddress } from "@/features/account/types";

type AddressCardProps = {
  address: CustomerAddress;
};

const formatAddressLine = (parts: Array<string | null>) =>
  parts.filter(Boolean).join(", ");

export function AddressCard({ address }: AddressCardProps) {
  return (
    <article className="border-border bg-panel rounded-[2rem] border p-5 shadow-[var(--shadow-panel)] sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-foreground text-xl font-semibold tracking-tight">
              {address.label ?? address.recipientName}
            </h2>
            {address.isDefault ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Default address
              </span>
            ) : null}
          </div>
          <div className="text-ink-muted space-y-1 text-sm leading-6">
            <p className="text-foreground font-medium">{address.recipientName}</p>
            <p>{address.line1}</p>
            {address.line2 ? <p>{address.line2}</p> : null}
            <p>
              {formatAddressLine([
                address.city,
                address.stateRegion,
                address.postalCode,
              ])}
            </p>
            <p>{address.countryCode}</p>
            {address.phone ? <p>{address.phone}</p> : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:justify-end">
          {!address.isDefault ? (
            <form action={setDefaultAddressAction}>
              <input type="hidden" name="addressId" value={address.id} />
              <button
                type="submit"
                className="border-border bg-panel-muted text-foreground inline-flex min-h-11 w-full items-center justify-center rounded-full border px-4 text-sm font-medium transition hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:w-auto lg:w-full"
              >
                Set default
              </button>
            </form>
          ) : null}

          <form action={deleteAddressAction}>
            <input type="hidden" name="addressId" value={address.id} />
            <button
              type="submit"
              className="border-border bg-white text-foreground inline-flex min-h-11 w-full items-center justify-center rounded-full border px-4 text-sm font-medium transition hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:w-auto lg:w-full"
            >
              Delete
            </button>
          </form>
        </div>
      </div>

      <details className="mt-6 rounded-[1.5rem] border border-border bg-panel-muted px-4 py-3">
        <summary className="text-brand cursor-pointer text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
          Edit address
        </summary>
        <div className="mt-5 border-t border-border pt-5">
          <AddressForm mode="edit" address={address} />
        </div>
      </details>
    </article>
  );
}
