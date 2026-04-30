import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatPrice } from "@/features/catalog/lib/format-price";
import { getSellerStatusDetails, getSellerStatusLabel } from "@/features/seller/lib/seller-status";
import type { SellerDashboardSummary } from "@/features/seller/types";
import type { SellerProfile } from "@/types/auth";

type SellerDashboardViewProps = {
  sellerProfile: SellerProfile | null;
  summary?: SellerDashboardSummary | null;
};

type MetricCardProps = {
  label: string;
  value: string | number;
  sublabel?: string;
};

function MetricCard({ label, value, sublabel }: MetricCardProps) {
  return (
    <div className="border-border bg-panel rounded-[1.75rem] border p-5 shadow-[var(--shadow-panel)]">
      <p className="text-ink-muted text-sm font-medium">{label}</p>
      <p className="text-foreground mt-2 text-3xl font-semibold tracking-tight">
        {value}
      </p>
      {sublabel ? (
        <p className="text-ink-muted mt-1 text-xs">{sublabel}</p>
      ) : null}
    </div>
  );
}

export function SellerDashboardView({
  sellerProfile,
  summary,
}: SellerDashboardViewProps) {
  const isApproved = sellerProfile?.status === "approved";
  const statusDetails = getSellerStatusDetails(sellerProfile?.status);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
          Seller workspace
        </p>
        <h1 className="text-foreground text-4xl font-semibold tracking-tight">
          {sellerProfile?.storeName ?? "Set up your store"}
        </h1>
        <p className="text-ink-muted max-w-3xl text-sm leading-7">
          {isApproved
            ? "Run your store from one place. Manage listings, review incoming orders, and keep your storefront ready for shoppers."
            : statusDetails?.description ??
              "Finish your store setup and wait for approval before seller operations open up."}
        </p>
      </div>

      <section className="border-border bg-panel rounded-[2rem] border p-6 shadow-[var(--shadow-panel)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <p className="text-brand text-sm font-semibold tracking-[0.12em] uppercase">
              Current seller status
            </p>
            <StatusBadge label={getSellerStatusLabel(sellerProfile?.status)} />
            <div className="space-y-2">
              <h2 className="text-foreground text-2xl font-semibold">
                {statusDetails?.title ?? "Store profile ready"}
              </h2>
              <p className="text-ink-muted max-w-2xl text-sm leading-7">
                {statusDetails?.nextStep ??
                  "Your store is approved. Keep your catalog current and stay on top of new orders."}
              </p>
            </div>
          </div>

          <Link
            href="/seller/settings"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-panel-muted px-5 text-sm font-medium text-foreground"
          >
            Manage store settings
          </Link>
        </div>
      </section>

      {isApproved && summary ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Total listings"
              value={summary.totalProducts}
              sublabel={`${summary.activeProducts} active · ${summary.draftProducts} draft · ${summary.archivedProducts} archived`}
            />
            <MetricCard
              label="Live listings"
              value={summary.activeProducts}
              sublabel={`${summary.lowStockProducts} running low on stock`}
            />
            <MetricCard
              label="Orders to fulfill"
              value={summary.unfulfilledOrders}
              sublabel={`${summary.totalOrderItems} total sold items`}
            />
            <MetricCard
              label="30-day sales"
              value={formatPrice(summary.last30DaysGrossSales, summary.currencyCode)}
              sublabel={`All-time: ${formatPrice(summary.grossSalesAmount, summary.currencyCode)}`}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Link
              href="/seller/products"
              className="border-border bg-panel rounded-[1.75rem] border p-6 shadow-[var(--shadow-panel)] transition hover:border-foreground/25"
            >
              <p className="text-brand text-sm font-semibold tracking-[0.12em] uppercase">
                Listings
              </p>
              <p className="text-foreground mt-2 text-xl font-semibold">
                Manage your product catalog
              </p>
              <p className="text-ink-muted mt-2 text-sm">
                Create, update, publish, and archive the items in your store.
              </p>
            </Link>

            <Link
              href="/seller/orders"
              className="border-border bg-panel rounded-[1.75rem] border p-6 shadow-[var(--shadow-panel)] transition hover:border-foreground/25"
            >
              <p className="text-brand text-sm font-semibold tracking-[0.12em] uppercase">
                Orders
              </p>
              <p className="text-foreground mt-2 text-xl font-semibold">
                Review store orders
              </p>
              <p className="text-ink-muted mt-2 text-sm">
                See the items customers purchased from your shop.
              </p>
            </Link>

            <Link
              href="/seller/products/new"
              className="border-border bg-panel rounded-[1.75rem] border p-6 shadow-[var(--shadow-panel)] transition hover:border-foreground/25"
            >
              <p className="text-brand text-sm font-semibold tracking-[0.12em] uppercase">
                New product
              </p>
              <p className="text-foreground mt-2 text-xl font-semibold">
                Add a new listing
              </p>
              <p className="text-ink-muted mt-2 text-sm">
                Start with a draft or publish something ready to sell.
              </p>
            </Link>
          </div>
        </>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {sellerProfile?.status === "rejected" ? (
            <div className="border-red-200 bg-red-50 rounded-[1.75rem] border p-6 shadow-[var(--shadow-panel)]">
              <p className="text-red-900 text-sm font-semibold tracking-[0.12em] uppercase">
                Rejection reason
              </p>
              <p className="text-red-900 mt-2 text-xl font-semibold">
                Application needs changes
              </p>
              <p className="text-red-800 mt-2 text-sm leading-7">
                {sellerProfile.rejectionReason ?? "No reason provided."}
              </p>
              <Link
                href="/seller/register"
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-red-900 px-5 text-sm font-semibold text-white hover:bg-red-800"
              >
                Resubmit application
              </Link>
            </div>
          ) : sellerProfile?.status === "suspended" ? (
            <div className="border-red-200 bg-red-50 rounded-[1.75rem] border p-6 shadow-[var(--shadow-panel)]">
              <p className="text-red-900 text-sm font-semibold tracking-[0.12em] uppercase">
                Suspension reason
              </p>
              <p className="text-red-900 mt-2 text-xl font-semibold">
                Store operations paused
              </p>
              <p className="text-red-800 mt-2 text-sm leading-7">
                {sellerProfile.suspensionReason ?? "No reason provided."}
              </p>
            </div>
          ) : (
            <div className="border-border bg-panel rounded-[1.75rem] border p-6 shadow-[var(--shadow-panel)]">
              <p className="text-brand text-sm font-semibold tracking-[0.12em] uppercase">
                Store profile
              </p>
              <p className="text-foreground mt-2 text-xl font-semibold">
                Keep your storefront details current
              </p>
              <p className="text-ink-muted mt-2 text-sm leading-7">
                Add a clear name, slug, description, and optional logo so the
                marketplace team can review your application with the right context.
              </p>
            </div>
          )}

          <div className="border-border bg-panel rounded-[1.75rem] border p-6 shadow-[var(--shadow-panel)]">
            <p className="text-brand text-sm font-semibold tracking-[0.12em] uppercase">
              Operational access
            </p>
            <p className="text-foreground mt-2 text-xl font-semibold">
              Product and order tools unlock after approval
            </p>
            <p className="text-ink-muted mt-2 text-sm leading-7">
              Once your seller account is approved, the products and orders tabs
              become your day-to-day workspace for inventory and sales.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
