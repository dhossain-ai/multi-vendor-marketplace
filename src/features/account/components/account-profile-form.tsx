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

      <section className="border-border bg-panel rounded-[2rem] border p-5 shadow-[var(--shadow-panel)] sm:p-6">
        <form action={updateProfileAction} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-foreground text-sm font-medium">Email</span>
              <input
                value={profile.email}
                readOnly
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
              className="border-border bg-white text-foreground min-h-12 w-full rounded-2xl border px-4 text-sm outline-none transition focus:border-brand"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="bg-brand inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-white"
            >
              Save profile
            </button>
            <Link
              href="/account"
              className="border-border bg-panel-muted text-foreground inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-medium"
            >
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
