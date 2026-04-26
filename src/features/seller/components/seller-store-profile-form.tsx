"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { AuthMessage } from "@/features/auth/components/auth-message";
import type { SellerStoreProfileFormData } from "@/features/seller/types";

import type { SellerProfile } from "@/types/auth";

type SellerStoreProfileFormProps = {
  mode: "apply" | "edit";
  status?: SellerProfile["status"];
  initialValues?: SellerStoreProfileFormData | null;
  notice?: string | null;
  error?: string | null;
  action: (formData: FormData) => Promise<void>;
};

function SubmitButton({ mode }: { mode: "apply" | "edit" }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending
        ? mode === "apply"
          ? "Submitting..."
          : "Saving..."
        : mode === "apply"
          ? "Submit seller application"
          : "Save store settings"}
    </button>
  );
}

export function SellerStoreProfileForm({
  mode,
  status,
  initialValues,
  notice,
  error,
  action,
}: SellerStoreProfileFormProps) {
  const isApproved = status === "approved";
  const isSuspended = status === "suspended";

  if (isSuspended) {
    return (
      <div className="space-y-6">
        <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm font-medium text-red-900">Your store is suspended</p>
          <p className="mt-1 text-sm text-red-800">You cannot edit store settings at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error ? <AuthMessage tone="error" message={error} /> : null}
      {notice && !error ? <AuthMessage tone="success" message={notice} /> : null}

      <form action={action} className="space-y-6">
        <div className="rounded-[2rem] border border-border bg-panel p-6 shadow-[var(--shadow-panel)]">
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="storeName" className="text-sm font-medium text-foreground">
                Store name
              </label>
              <input
                id="storeName"
                name="storeName"
                required
                minLength={2}
                maxLength={120}
                defaultValue={initialValues?.storeName ?? ""}
                className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                placeholder="Northforge Supply"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-medium text-foreground">
                Store slug
              </label>
              <input
                id="slug"
                name="slug"
                required
                readOnly={isApproved}
                minLength={3}
                maxLength={120}
                defaultValue={initialValues?.slug ?? ""}
                className={`block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none ${isApproved ? "opacity-60 cursor-not-allowed" : ""}`}
                placeholder="northforge-supply"
              />
              <p className="text-xs text-ink-muted">
                {isApproved 
                  ? "Your store slug is locked after approval. Contact support to change it."
                  : "Lowercase letters, numbers, and hyphens only. This helps identify your store across the marketplace."}
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium text-foreground">
                Store description
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={5}
                maxLength={600}
                defaultValue={initialValues?.bio ?? ""}
                className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                placeholder="Tell customers what your store sells and what makes it worth following."
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="supportEmail" className="text-sm font-medium text-foreground">
                  Support email
                </label>
                <input
                  id="supportEmail"
                  name="supportEmail"
                  type="email"
                  required
                  defaultValue={initialValues?.supportEmail ?? ""}
                  className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                  placeholder="support@example.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="countryCode" className="text-sm font-medium text-foreground">
                  Country code
                </label>
                <input
                  id="countryCode"
                  name="countryCode"
                  required
                  minLength={2}
                  maxLength={2}
                  defaultValue={initialValues?.countryCode ?? ""}
                  className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                  placeholder="US"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="businessEmail" className="text-sm font-medium text-foreground">
                  Business email <span className="font-normal text-ink-muted">(optional)</span>
                </label>
                <input
                  id="businessEmail"
                  name="businessEmail"
                  type="email"
                  defaultValue={initialValues?.businessEmail ?? ""}
                  className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                  placeholder="business@example.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-foreground">
                  Phone number <span className="font-normal text-ink-muted">(optional)</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={initialValues?.phone ?? ""}
                  className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                  placeholder="+1 555 0123"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="logoUrl" className="text-sm font-medium text-foreground">
                Logo image URL
              </label>
              <input
                id="logoUrl"
                name="logoUrl"
                type="url"
                defaultValue={initialValues?.logoUrl ?? ""}
                className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                placeholder="https://example.com/logo.png"
              />
              <p className="text-xs text-ink-muted">
                Optional for now. A square image works best if you have one.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton mode={mode} />
          <Link
            href={mode === "apply" ? "/account" : "/seller"}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-panel-muted px-5 text-sm font-medium text-foreground"
          >
            {mode === "apply" ? "Back to account" : "Back to seller dashboard"}
          </Link>
        </div>
      </form>
    </div>
  );
}
