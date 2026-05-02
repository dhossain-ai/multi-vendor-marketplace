import type { CustomerAddress } from "@/features/account/types";
import {
  createAddressAction,
  updateAddressAction,
} from "@/features/account/lib/account-actions";

type AddressFormProps = {
  address?: CustomerAddress;
  mode: "create" | "edit";
};

const inputClass =
  "border-border bg-white text-foreground min-h-12 w-full rounded-2xl border px-4 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

const optionalValue = (value: string | null | undefined) => value ?? "";

export function AddressForm({ address, mode }: AddressFormProps) {
  const isEdit = mode === "edit";

  return (
    <form
      id={isEdit ? undefined : "address-form"}
      action={isEdit ? updateAddressAction : createAddressAction}
      className="space-y-5"
    >
      {isEdit && address ? (
        <input type="hidden" name="addressId" value={address.id} />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-foreground text-sm font-medium">Label</span>
          <input
            name="label"
            type="text"
            maxLength={80}
            placeholder="Home, work, or another label"
            defaultValue={optionalValue(address?.label)}
            className={inputClass}
          />
        </label>

        <label className="space-y-2">
          <span className="text-foreground text-sm font-medium">
            Recipient name
          </span>
          <input
            name="recipientName"
            type="text"
            required
            maxLength={120}
            defaultValue={optionalValue(address?.recipientName)}
            className={inputClass}
          />
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-foreground text-sm font-medium">
          Address line 1
        </span>
        <input
          name="line1"
          type="text"
          required
          maxLength={160}
          defaultValue={optionalValue(address?.line1)}
          className={inputClass}
        />
      </label>

      <label className="block space-y-2">
        <span className="text-foreground text-sm font-medium">
          Address line 2
        </span>
        <input
          name="line2"
          type="text"
          maxLength={160}
          defaultValue={optionalValue(address?.line2)}
          className={inputClass}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-foreground text-sm font-medium">City</span>
          <input
            name="city"
            type="text"
            required
            maxLength={100}
            defaultValue={optionalValue(address?.city)}
            className={inputClass}
          />
        </label>

        <label className="space-y-2">
          <span className="text-foreground text-sm font-medium">
            State / region
          </span>
          <input
            name="stateRegion"
            type="text"
            maxLength={100}
            defaultValue={optionalValue(address?.stateRegion)}
            className={inputClass}
          />
        </label>

        <label className="space-y-2">
          <span className="text-foreground text-sm font-medium">
            Postal code
          </span>
          <input
            name="postalCode"
            type="text"
            maxLength={32}
            defaultValue={optionalValue(address?.postalCode)}
            className={inputClass}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-foreground text-sm font-medium">
            Country code
          </span>
          <input
            name="countryCode"
            type="text"
            required
            maxLength={2}
            pattern="[A-Za-z]{2}"
            defaultValue={address?.countryCode ?? "US"}
            className={`${inputClass} uppercase`}
          />
        </label>

        <label className="space-y-2">
          <span className="text-foreground text-sm font-medium">Phone</span>
          <input
            name="phone"
            type="tel"
            maxLength={40}
            defaultValue={optionalValue(address?.phone)}
            className={inputClass}
          />
        </label>
      </div>

      <label className="flex items-start gap-3 text-sm text-foreground">
        <input
          name="makeDefault"
          type="checkbox"
          defaultChecked={!isEdit || address?.isDefault}
          disabled={isEdit && address?.isDefault}
          className="mt-1 size-4 rounded border-border accent-brand"
        />
        <span>
          Use as my default shipping address
          <span className="text-ink-muted block">
            Checkout preselects your default address when available.
          </span>
        </span>
      </label>

      <button
        type="submit"
        className="bg-brand inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 text-sm font-semibold text-white transition hover:bg-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:w-auto"
      >
        {isEdit ? "Save changes" : "Add address"}
      </button>
    </form>
  );
}
