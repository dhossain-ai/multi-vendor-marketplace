import Link from "next/link";
import { signOutAction } from "@/lib/auth/actions";
import type { AppProfile, SellerProfile } from "@/types/auth";

type AccountSummaryProps = {
  profile: AppProfile;
  sellerProfile: SellerProfile | null;
  notice?: string | null;
};

export function AccountSummary({
  profile,
  sellerProfile,
  notice,
}: AccountSummaryProps) {
  return (
    <div className="space-y-8">
      {notice ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {notice}
        </div>
      ) : null}

      <section className="border-border bg-panel rounded-[2rem] border p-8 shadow-[var(--shadow-panel)]">
        <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
          Account
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          {profile.fullName ?? "Marketplace account"}
        </h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-white/80 p-5">
            <p className="text-ink-muted text-sm">Email</p>
            <p className="mt-2 text-base font-medium text-foreground">
              {profile.email}
            </p>
          </div>
          <div className="rounded-3xl bg-white/80 p-5">
            <p className="text-ink-muted text-sm">Role</p>
            <p className="mt-2 text-base font-medium text-foreground capitalize">
              {profile.role}
            </p>
          </div>
          <div className="rounded-3xl bg-white/80 p-5">
            <p className="text-ink-muted text-sm">Account status</p>
            <p className="mt-2 text-base font-medium text-foreground">
              {profile.isActive ? "Active" : "Inactive"}
            </p>
          </div>
          <div className="rounded-3xl bg-white/80 p-5">
            <p className="text-ink-muted text-sm">Seller status</p>
            <p className="mt-2 text-base font-medium text-foreground capitalize">
              {sellerProfile?.status ?? "No seller profile"}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="border-border bg-panel rounded-[2rem] border p-6 shadow-[var(--shadow-panel)]">
          <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
            Orders
          </p>
          <p className="text-ink-muted mt-3 text-sm leading-7">
            Customer order history now reads from pending-order snapshots instead
            of live catalog records.
          </p>
          <Link
            href="/orders"
            className="text-brand mt-5 inline-flex text-sm font-medium"
          >
            Open order history
          </Link>
        </article>

        <article className="border-border bg-panel rounded-[2rem] border p-6 shadow-[var(--shadow-panel)]">
          <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
            Seller area
          </p>
          <p className="text-ink-muted mt-3 text-sm leading-7">
            Seller tooling is not implemented yet, but the protected route and
            seller-status foundation are now in place.
          </p>
          <Link
            href="/seller"
            className="text-brand mt-5 inline-flex text-sm font-medium"
          >
            Open seller access placeholder
          </Link>
        </article>

        <article className="border-border bg-panel rounded-[2rem] border p-6 shadow-[var(--shadow-panel)]">
          <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
            Admin area
          </p>
          <p className="text-ink-muted mt-3 text-sm leading-7">
            Admin features remain deferred, but role-based protection is ready to
            support them safely in later phases.
          </p>
          <Link
            href="/admin"
            className="text-brand mt-5 inline-flex text-sm font-medium"
          >
            Open admin access placeholder
          </Link>
        </article>
      </section>

      <form action={signOutAction}>
        <button
          type="submit"
          className="border-border bg-panel rounded-full border px-5 py-3 text-sm font-medium text-foreground"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
