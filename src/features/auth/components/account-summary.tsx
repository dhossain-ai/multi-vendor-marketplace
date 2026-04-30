import Link from "next/link";
import { signOutAction } from "@/lib/auth/actions";
import { getSellerStatusLabel } from "@/features/seller/lib/seller-status";
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
  const joinedDate = new Date(profile.createdAt).toLocaleDateString();
  const canAccessSellerDashboard =
    profile.role === "seller" && sellerProfile?.status === "approved";
  const showSellerAccess = profile.role !== "admin";
  const showAdminAccess = profile.role === "admin";
  const sellerLink = canAccessSellerDashboard ? "/seller" : "/seller/register";
  const sellerLinkLabel = canAccessSellerDashboard
    ? "Open seller dashboard"
    : sellerProfile
      ? "Manage seller application"
      : "Become a seller";

  return (
    <div className="space-y-8">
      {notice ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {notice}
        </div>
      ) : null}

      <section className="border-border bg-panel rounded-[2rem] border p-8 shadow-[var(--shadow-panel)]">
        <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
          Your account
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          {profile.fullName ?? "Welcome back"}
        </h1>
        <p className="text-ink-muted mt-3 max-w-2xl text-sm leading-7">
          Keep your profile current, manage shipping addresses, and review your
          marketplace orders.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-white/80 p-5">
            <p className="text-ink-muted text-sm">Email</p>
            <p className="mt-2 text-base font-medium text-foreground">
              {profile.email}
            </p>
          </div>
          <div className="rounded-3xl bg-white/80 p-5">
            <p className="text-ink-muted text-sm">Account type</p>
            <p className="mt-2 text-base font-medium text-foreground capitalize">
              {profile.role}
            </p>
          </div>
          <div className="rounded-3xl bg-white/80 p-5">
            <p className="text-ink-muted text-sm">Account status</p>
            <StatusBadge
              label={profile.isActive ? "active" : "inactive"}
              className="mt-2"
            />
          </div>
          <div className="rounded-3xl bg-white/80 p-5">
            <p className="text-ink-muted text-sm">Member since</p>
            <p className="mt-2 text-base font-medium text-foreground capitalize">
              {joinedDate}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="border-border bg-panel rounded-[2rem] border p-6 shadow-[var(--shadow-panel)]">
          <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
            Profile
          </p>
          <p className="text-ink-muted mt-3 text-sm leading-7">
            Update the name shown on your customer account.
          </p>
          <Link
            href="/account/profile"
            className="border-border bg-panel-muted text-foreground mt-5 inline-flex min-h-10 items-center justify-center rounded-full border px-4 text-sm font-medium"
          >
            Edit profile
          </Link>
        </article>

        <article className="border-border bg-panel rounded-[2rem] border p-6 shadow-[var(--shadow-panel)]">
          <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
            Address book
          </p>
          <p className="text-ink-muted mt-3 text-sm leading-7">
            Add shipping addresses and choose the default you use most often.
          </p>
          <Link
            href="/account/addresses"
            className="border-border bg-panel-muted text-foreground mt-5 inline-flex min-h-10 items-center justify-center rounded-full border px-4 text-sm font-medium"
          >
            Manage addresses
          </Link>
        </article>

        <article className="border-border bg-panel rounded-[2rem] border p-6 shadow-[var(--shadow-panel)]">
          <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
            Orders
          </p>
          <p className="text-ink-muted mt-3 text-sm leading-7">
            Review recent purchases, payment progress, and saved order totals in one place.
          </p>
          <Link
            href="/orders"
            className="border-border bg-panel-muted text-foreground mt-5 inline-flex min-h-10 items-center justify-center rounded-full border px-4 text-sm font-medium"
          >
            View your orders
          </Link>
        </article>

        <article className="border-border bg-panel rounded-[2rem] border p-6 shadow-[var(--shadow-panel)]">
          <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
            Shopping
          </p>
          <p className="text-ink-muted mt-3 text-sm leading-7">
            Return to the storefront to browse categories, discover new arrivals,
            and add more items to your cart.
          </p>
          <Link
            href="/"
            className="border-border bg-panel-muted text-foreground mt-5 inline-flex min-h-10 items-center justify-center rounded-full border px-4 text-sm font-medium"
          >
            Continue shopping
          </Link>
        </article>
      </section>

      {showSellerAccess || showAdminAccess ? (
        <section className="space-y-4">
          <div>
            <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
              Selling and operations
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              Additional tools
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {showSellerAccess ? (
              <article className="border-border bg-panel rounded-[2rem] border p-6 shadow-[var(--shadow-panel)]">
                <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
                  Sell on the marketplace
                </p>
                <h3 className="mt-2 text-xl font-semibold text-foreground">
                  {sellerProfile?.storeName ?? "Open your store"}
                </h3>
                <p className="text-ink-muted mt-3 text-sm leading-7">
                  {sellerProfile
                    ? `Current seller status: ${getSellerStatusLabel(
                        sellerProfile.status,
                      ).toLowerCase()}. Keep your store profile current so the marketplace team and your customers see the right information.`
                    : "Apply to sell through the marketplace, set up your store profile, and unlock product and order tools after approval."}
                </p>
                <Link
                  href={sellerLink}
                  className="border-border bg-panel-muted text-foreground mt-5 inline-flex min-h-10 items-center justify-center rounded-full border px-4 text-sm font-medium"
                >
                  {sellerLinkLabel}
                </Link>
              </article>
            ) : null}

            {showAdminAccess ? (
              <article className="border-border bg-panel rounded-[2rem] border p-6 shadow-[var(--shadow-panel)]">
                <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
                  Admin tools
                </p>
                <h3 className="mt-2 text-xl font-semibold text-foreground">
                  Marketplace operations
                </h3>
                <p className="text-ink-muted mt-3 text-sm leading-7">
                  Review sellers, moderate products, manage categories and coupons,
                  and monitor orders from the admin area.
                </p>
                <Link
                  href="/admin"
                  className="border-border bg-panel-muted text-foreground mt-5 inline-flex min-h-10 items-center justify-center rounded-full border px-4 text-sm font-medium"
                >
                  Open admin dashboard
                </Link>
              </article>
            ) : null}
          </div>
        </section>
      ) : null}

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
import { StatusBadge } from "@/components/ui/status-badge";
