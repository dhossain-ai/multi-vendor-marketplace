import Link from "next/link";
import { formatPrice } from "@/features/catalog/lib/format-price";
import { AdminSummaryCard } from "@/features/admin/components/admin-summary-card";
import type { AdminDashboardSummary } from "@/features/admin/types";

type AdminDashboardViewProps = {
  summary: AdminDashboardSummary;
  adminName: string;
};

export function AdminDashboardView({
  summary,
  adminName,
}: AdminDashboardViewProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold tracking-[0.16em] text-brand uppercase">
          Admin dashboard
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          {adminName}
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-ink-muted">
          Run daily marketplace operations from one place, including seller review,
          product moderation, categories, coupons, and order monitoring.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AdminSummaryCard
          label="Customers"
          value={summary.totalCustomers}
          sublabel="Profiles with customer role"
        />
        <AdminSummaryCard
          label="Sellers"
          value={summary.totalSellers}
          sublabel={`${summary.pendingSellerApplications} pending review`}
        />
        <AdminSummaryCard
          label="Active products"
          value={summary.activeProducts}
          sublabel="Currently visible to customers"
        />
        <AdminSummaryCard
          label="Recent orders"
          value={summary.recentOrdersCount}
          sublabel="Orders created in the last 7 days"
        />
        <AdminSummaryCard
          label="Gross revenue"
          value={formatPrice(summary.grossRevenueAmount, summary.currencyCode)}
          sublabel="Paid order total"
        />
        <AdminSummaryCard
          label="Pending seller applications"
          value={summary.pendingSellerApplications}
          sublabel="Operational queue ready for moderation"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Link
          href="/admin/sellers"
          className="rounded-[1.75rem] border border-border bg-panel p-6 shadow-[var(--shadow-panel)] transition hover:border-foreground/25"
        >
          <p className="text-sm font-semibold tracking-[0.12em] text-brand uppercase">
            Seller review
          </p>
          <p className="mt-2 text-xl font-semibold text-foreground">
            Approve, reject, and suspend sellers
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            Review applications and keep seller status changes deliberate.
          </p>
        </Link>

        <Link
          href="/admin/products"
          className="rounded-[1.75rem] border border-border bg-panel p-6 shadow-[var(--shadow-panel)] transition hover:border-foreground/25"
        >
          <p className="text-sm font-semibold tracking-[0.12em] text-brand uppercase">
            Product moderation
          </p>
          <p className="mt-2 text-xl font-semibold text-foreground">
            Suspend or reactivate products
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            Keep unsafe or unavailable inventory out of the storefront.
          </p>
        </Link>

        <Link
          href="/admin/orders"
          className="rounded-[1.75rem] border border-border bg-panel p-6 shadow-[var(--shadow-panel)] transition hover:border-foreground/25"
        >
          <p className="text-sm font-semibold tracking-[0.12em] text-brand uppercase">
            Order monitoring
          </p>
          <p className="mt-2 text-xl font-semibold text-foreground">
            Inspect platform-wide orders
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            Track order health without stepping into refund or payout tooling yet.
          </p>
        </Link>
      </div>
    </div>
  );
}
