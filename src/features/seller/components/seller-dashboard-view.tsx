import Link from "next/link";
import { formatPrice } from "@/features/catalog/lib/format-price";
import type { SellerDashboardSummary } from "@/features/seller/types";

type SellerDashboardViewProps = {
  summary: SellerDashboardSummary;
  storeName: string;
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
  summary,
  storeName,
}: SellerDashboardViewProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
          Seller dashboard
        </p>
        <h1 className="text-foreground text-4xl font-semibold tracking-tight">
          {storeName}
        </h1>
        <p className="text-ink-muted max-w-3xl text-sm leading-7">
          Overview of your store performance and inventory. Manage your products
          and view orders from the navigation above.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total products"
          value={summary.totalProducts}
          sublabel={`${summary.activeProducts} active · ${summary.draftProducts} draft · ${summary.archivedProducts} archived`}
        />
        <MetricCard
          label="Active products"
          value={summary.activeProducts}
          sublabel="Visible to customers"
        />
        <MetricCard
          label="Paid orders"
          value={summary.totalOrderItems}
          sublabel="Confirmed line items"
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
            Products
          </p>
          <p className="text-foreground mt-2 text-xl font-semibold">
            Manage your inventory
          </p>
          <p className="text-ink-muted mt-2 text-sm">
            Create, edit, publish, and archive products.
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
            View your sales
          </p>
          <p className="text-ink-muted mt-2 text-sm">
            See order items for products you sold.
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
            Add a product
          </p>
          <p className="text-ink-muted mt-2 text-sm">
            Create a draft or publish immediately.
          </p>
        </Link>
      </div>
    </div>
  );
}
