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
    <article className="border-border bg-panel rounded-[2rem] border p-6 shadow-[var(--shadow-panel)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-foreground text-xl font-semibold tracking-tight">
              {address.label ?? address.recipientName}
            </h2>
            {address.isDefault ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Default
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

        <div className="flex flex-wrap gap-3 lg:justify-end">
          {!address.isDefault ? (
            <form action={setDefaultAddressAction}>
              <input type="hidden" name="addressId" value={address.id} />
              <button
                type="submit"
                className="border-border bg-panel-muted text-foreground inline-flex min-h-10 items-center justify-center rounded-full border px-4 text-sm font-medium"
              >
                Set default
              </button>
            </form>
          ) : null}

          <form action={deleteAddressAction}>
            <input type="hidden" name="addressId" value={address.id} />
            <button
              type="submit"
              className="border-border bg-white text-foreground inline-flex min-h-10 items-center justify-center rounded-full border px-4 text-sm font-medium"
            >
              Delete
            </button>
          </form>
        </div>
      </div>

      <details className="mt-6">
        <summary className="text-brand cursor-pointer text-sm font-medium">
          Edit address
        </summary>
        <div className="mt-5 border-t border-border pt-5">
          <AddressForm mode="edit" address={address} />
        </div>
      </details>
    </article>
  );
}
