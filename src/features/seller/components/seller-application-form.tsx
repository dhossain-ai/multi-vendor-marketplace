"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { AuthMessage } from "@/features/auth/components/auth-message";
import type { SellerApplicationFormData } from "@/features/seller/types";

type SellerApplicationFormProps = {
  mode: "apply" | "resubmit";
  initialValues?: Partial<SellerApplicationFormData> | null;
  notice?: string | null;
  error?: string | null;
  action: (formData: FormData) => Promise<void>;
};

const countryOptions = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "GB", label: "United Kingdom" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "LT", label: "Lithuania" },
];

function SubmitButton({ mode }: { mode: "apply" | "resubmit" }) {
  const { pending } = useFormStatus();
  const label = mode === "resubmit" ? "Resubmit application" : "Submit application";

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Submitting..." : label}
    </button>
  );
}

export function SellerApplicationForm({
  mode,
  initialValues,
  notice,
  error,
  action,
}: SellerApplicationFormProps) {
  return (
    <div className="space-y-6">
      {error ? <AuthMessage tone="error" message={error} /> : null}
      {notice && !error ? <AuthMessage tone="success" message={notice} /> : null}

      <form action={action} className="space-y-6">
        <div className="rounded-[2rem] border border-border bg-panel p-6 shadow-[var(--shadow-panel)]">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Store name</span>
              <input
                name="storeName"
                required
                minLength={2}
                maxLength={120}
                defaultValue={initialValues?.storeName ?? ""}
                className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                placeholder="Northforge Supply"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Store slug</span>
              <input
                name="slug"
                required
                minLength={3}
                maxLength={120}
                defaultValue={initialValues?.slug ?? ""}
                className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                placeholder="northforge-supply"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-foreground">Store description</span>
              <textarea
                name="bio"
                required
                minLength={20}
                maxLength={600}
                rows={5}
                defaultValue={initialValues?.bio ?? ""}
                className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                placeholder="Tell us what your store sells, where you operate, and what customers should expect."
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Support email</span>
              <input
                name="supportEmail"
                type="email"
                required
                defaultValue={initialValues?.supportEmail ?? ""}
                className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                placeholder="support@example.com"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Country</span>
              <select
                name="countryCode"
                required
                defaultValue={initialValues?.countryCode ?? ""}
                className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
              >
                <option value="">Select a country</option>
                {countryOptions.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Business email</span>
              <input
                name="businessEmail"
                type="email"
                defaultValue={initialValues?.businessEmail ?? ""}
                className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                placeholder="business@example.com"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Phone</span>
              <input
                name="phone"
                type="tel"
                defaultValue={initialValues?.phone ?? ""}
                className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                placeholder="+1 555 0100"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-foreground">Logo image URL</span>
              <input
                name="logoUrl"
                type="url"
                defaultValue={initialValues?.logoUrl ?? ""}
                className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                placeholder="https://example.com/logo.png"
              />
            </label>
          </div>
        </div>

        <label className="flex gap-3 rounded-[2rem] border border-border bg-panel p-5 text-sm leading-6 text-ink-muted shadow-[var(--shadow-panel)]">
          <input
            name="agreementAccepted"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 rounded border-border text-brand"
          />
          <span>
            I confirm this store information is accurate and agree to follow the marketplace seller terms and review process.
          </span>
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton mode={mode} />
          <Link
            href="/account"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-panel-muted px-5 text-sm font-medium text-foreground"
          >
            Back to account
          </Link>
        </div>
      </form>
    </div>
  );
}
