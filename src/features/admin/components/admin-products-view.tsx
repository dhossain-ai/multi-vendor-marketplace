import { AuthMessage } from "@/features/auth/components/auth-message";
import { formatPrice } from "@/features/catalog/lib/format-price";
import { AdminActionButton } from "@/features/admin/components/admin-action-button";
import { AdminStatusBadge } from "@/features/admin/components/admin-status-badge";
import { updateProductModerationAction } from "@/features/admin/lib/admin-actions";
import type { AdminProduct, AdminProductStatus } from "@/features/admin/types";

type AdminProductsViewProps = {
  products: AdminProduct[];
  currentStatus: AdminProductStatus | null;
  notice?: string | null;
  error?: string | null;
};

export function AdminProductsView({
  products,
  currentStatus,
  notice,
  error,
}: AdminProductsViewProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold tracking-[0.16em] text-brand uppercase">
          Product moderation
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          Products
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-ink-muted">
          Review listings across the marketplace. Suspended products return as drafts
          so they never go back live without an intentional seller update.
        </p>
      </div>

      <form method="get" className="flex flex-col gap-3 rounded-[1.75rem] border border-border bg-panel p-5 shadow-[var(--shadow-panel)] sm:flex-row sm:flex-wrap sm:items-end">
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium text-foreground">
            Filter by status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={currentStatus ?? ""}
            className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none sm:min-w-48"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-white"
        >
          Apply filter
        </button>
      </form>

      {error ? <AuthMessage tone="error" message={error} /> : null}
      {notice && !error ? <AuthMessage tone="success" message={notice} /> : null}

      {products.length === 0 ? (
        <div className="rounded-[2rem] border border-border bg-panel p-10 text-center shadow-[var(--shadow-panel)]">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            No products found
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-ink-muted">
            There are no products matching the current moderation filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="rounded-[1.75rem] border border-border bg-panel p-5 shadow-[var(--shadow-panel)]"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <AdminStatusBadge label={product.status} />
                    {product.sellerName ? (
                      <span className="text-xs text-ink-muted">
                        Seller: {product.sellerName}
                      </span>
                    ) : null}
                    {product.categoryName ? (
                      <span className="text-xs text-ink-muted">
                        Category: {product.categoryName}
                      </span>
                    ) : null}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                      {product.title}
                    </h2>
                    <p className="mt-1 text-sm text-ink-muted">/{product.slug}</p>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-3 xl:items-end">
                  <p className="text-xl font-semibold text-foreground">
                    {formatPrice(product.priceAmount, product.currencyCode)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.status !== "suspended" ? (
                      <form action={updateProductModerationAction}>
                        <input type="hidden" name="productId" value={product.id} />
                        <input type="hidden" name="productSlug" value={product.slug} />
                        <input type="hidden" name="action" value="suspend" />
                        <AdminActionButton
                          idleLabel="Suspend"
                          pendingLabel="Suspending..."
                          tone="danger"
                        />
                      </form>
                    ) : (
                      <form action={updateProductModerationAction}>
                        <input type="hidden" name="productId" value={product.id} />
                        <input type="hidden" name="productSlug" value={product.slug} />
                        <input type="hidden" name="action" value="reactivate" />
                        <AdminActionButton
                          idleLabel="Reactivate as draft"
                          pendingLabel="Reactivating..."
                          tone="secondary"
                        />
                      </form>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-ink-muted">
                <span>Seller status: {product.sellerStatus ?? "unknown"}</span>
                <span>
                  Inventory:{" "}
                  {product.isUnlimitedStock
                    ? "Unlimited"
                    : product.stockQuantity == null
                      ? "Not set"
                      : product.stockQuantity <= 0
                        ? "Out of stock"
                        : product.stockQuantity <= 5
                          ? `Low stock (${product.stockQuantity})`
                          : `${product.stockQuantity} in stock`}
                </span>
                <span>Updated: {new Date(product.updatedAt).toLocaleString()}</span>
                {product.publishedAt ? (
                  <span>Published: {new Date(product.publishedAt).toLocaleDateString()}</span>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
