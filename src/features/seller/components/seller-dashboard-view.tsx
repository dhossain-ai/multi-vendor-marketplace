import Link from "next/link";
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
            <div className="inline-flex rounded-full bg-panel-muted px-3 py-1 text-xs font-semibold text-foreground">
              {getSellerStatusLabel(sellerProfile?.status)}
            </div>
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
              sublabel="Visible to customers"
            />
            <MetricCard
              label="Sold items"
              value={summary.totalOrderItems}
              sublabel="Paid line items"
            />
            <MetricCard
              label="Gross sales"
              value={formatPrice(summary.grossSalesAmount, summary.currencyCode)}
              sublabel="From paid orders"
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
          <div className="border-border bg-panel rounded-[1.75rem] border p-6 shadow-[var(--shadow-panel)]">
            <p className="text-brand text-sm font-semibold tracking-[0.12em] uppercase">
              Store profile
            </p>
            <p className="text-foreground mt-2 text-xl font-semibold">
              Keep your storefront details current
            </p>
            <p className="text-ink-muted mt-2 text-sm leading-7">
              Add a clear name, slug, description, and optional logo so the marketplace team can review your application with the right context.
            </p>
          </div>

          <div className="border-border bg-panel rounded-[1.75rem] border p-6 shadow-[var(--shadow-panel)]">
            <p className="text-brand text-sm font-semibold tracking-[0.12em] uppercase">
              Operational access
            </p>
            <p className="text-foreground mt-2 text-xl font-semibold">
              Product and order tools unlock after approval
            </p>
            <p className="text-ink-muted mt-2 text-sm leading-7">
              Once your seller account is approved, the products and orders tabs become your day-to-day workspace for inventory and sales.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
