import Link from "next/link";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { updateProfileAction } from "@/features/account/lib/account-actions";
import type { AppProfile } from "@/types/auth";

type AccountProfileFormProps = {
  profile: AppProfile;
  notice?: string | null;
  error?: string | null;
};

export function AccountProfileForm({
  profile,
  notice,
  error,
}: AccountProfileFormProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Link href="/account" className="text-brand text-sm font-medium">
          Back to account
        </Link>
        <div className="space-y-3">
          <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
            Profile
          </p>
          <h1 className="text-foreground text-4xl font-semibold tracking-tight">
            Account details
          </h1>
          <p className="text-ink-muted max-w-3xl text-sm leading-7">
            Keep your name current for account and order communication.
          </p>
        </div>
        {error ? <AuthMessage tone="error" message={error} /> : null}
        {!error && notice ? <AuthMessage tone="success" message={notice} /> : null}
      </div>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="border-border bg-panel rounded-[2rem] border p-5 shadow-[var(--shadow-panel)] sm:p-6">
        <form action={updateProfileAction} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-foreground text-sm font-medium">Email</span>
              <input
                value={profile.email}
                readOnly
                aria-label="Email address"
                className="border-border bg-panel-muted text-ink-muted min-h-12 w-full rounded-2xl border px-4 text-sm"
              />
            </label>

            <label className="space-y-2">
              <span className="text-foreground text-sm font-medium">
                Account type
              </span>
              <input
                value={profile.role}
                readOnly
                aria-label="Account type"
                className="border-border bg-panel-muted text-ink-muted min-h-12 w-full rounded-2xl border px-4 text-sm capitalize"
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-foreground text-sm font-medium">Full name</span>
            <input
              name="fullName"
              type="text"
              maxLength={120}
              defaultValue={profile.fullName ?? ""}
              className="border-border bg-white text-foreground min-h-12 w-full rounded-2xl border px-4 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <span className="text-ink-muted block text-xs">
              This name helps personalize your customer account and order views.
            </span>
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="bg-brand inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-white transition hover:bg-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              Save profile
            </button>
            <Link
              href="/account"
              className="border-border bg-panel-muted text-foreground inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-medium transition hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              Cancel
            </Link>
          </div>
        </form>
        </div>
        <aside className="border-border bg-panel rounded-[2rem] border p-5 text-sm leading-6 text-ink-muted shadow-[var(--shadow-panel)] sm:p-6">
          <p className="text-brand font-semibold tracking-[0.16em] uppercase">
            Account privacy
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
            Read-only account fields
          </h2>
          <p className="mt-3">
            Email and account type are managed by the secure sign-in and role system.
            Only your display name can be edited here.
          </p>
        </aside>
      </section>
    </div>
  );
}
