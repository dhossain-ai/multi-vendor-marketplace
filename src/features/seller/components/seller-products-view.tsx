import Link from "next/link";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { CartSubmitButton } from "@/features/cart/components/cart-submit-button";
import { formatPrice } from "@/features/catalog/lib/format-price";
import { archiveProductAction } from "@/features/seller/lib/seller-actions";
import type { SellerProduct } from "@/features/seller/types";

type SellerProductsViewProps = {
  products: SellerProduct[];
  notice?: string | null;
  error?: string | null;
};

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800",
  draft: "bg-amber-100 text-amber-800",
  archived: "bg-gray-100 text-gray-700",
  suspended: "bg-red-100 text-red-800",
};

const getInventoryLabel = (product: SellerProduct) => {
  if (product.status === "archived") {
    return "Archived";
  }

  if (product.isUnlimitedStock) {
    return "Unlimited stock";
  }

  if ((product.stockQuantity ?? 0) <= 0) {
    return "Out of stock";
  }

  if ((product.stockQuantity ?? 0) <= product.lowStockThreshold) {
    return `Low stock (${product.stockQuantity})`;
  }

  return `${product.stockQuantity} in stock`;
};

export function SellerProductsView({
  products,
  notice,
  error,
}: SellerProductsViewProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
              Your listings
            </p>
            <h1 className="text-foreground mt-1 text-4xl font-semibold tracking-tight">
              Products
            </h1>
          </div>
          <Link
            href="/seller/products/new"
            className="bg-brand inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-white"
          >
            Add product
          </Link>
        </div>
        <p className="text-ink-muted max-w-3xl text-sm leading-7">
          Keep your store fresh with clear titles, pricing, and status updates.
          Changes affect future sales only, so past orders stay intact.
        </p>
      </div>

      {error ? <AuthMessage tone="error" message={error} /> : null}
      {notice && !error ? <AuthMessage tone="success" message={notice} /> : null}

      {products.length === 0 ? (
        <div className="border-border bg-panel rounded-[2rem] border p-10 text-center shadow-[var(--shadow-panel)]">
          <h2 className="text-foreground text-3xl font-semibold tracking-tight">
            No listings yet
          </h2>
          <p className="text-ink-muted mx-auto mt-4 max-w-2xl text-sm leading-7">
            Add your first product to start building out your store.
          </p>
          <div className="mt-8">
            <Link
              href="/seller/products/new"
              className="bg-brand inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-white"
            >
              Create your first listing
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="border-border bg-panel rounded-[1.75rem] border p-5 shadow-[var(--shadow-panel)]"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[product.status] ?? "bg-gray-100 text-gray-700"}`}
                    >
                      {product.status}
                    </span>
                    <span className="text-ink-muted text-xs">
                      /{product.slug}
                    </span>
                  </div>
                  <h2 className="text-foreground text-xl font-semibold tracking-tight">
                    {product.title}
                  </h2>
                  {product.shortDescription ? (
                    <p className="text-ink-muted text-sm line-clamp-2">
                      {product.shortDescription}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col items-end gap-3">
                  <p className="text-foreground text-xl font-semibold">
                    {formatPrice(product.priceAmount, product.currencyCode)}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {product.status !== "suspended" ? (
                      <Link
                        href={`/seller/products/${product.id}/edit`}
                        className="border-border bg-panel-muted text-foreground inline-flex min-h-9 items-center justify-center rounded-full border px-4 text-xs font-medium"
                      >
                        Edit listing
                      </Link>
                    ) : (
                      <span className="inline-flex min-h-9 items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 text-xs font-medium text-red-700">
                        Suspended by admin
                      </span>
                    )}
                    {product.status !== "archived" && product.status !== "suspended" ? (
                      <form
                        action={async () => {
                          "use server";
                          await archiveProductAction(product.id);
                        }}
                      >
                        <CartSubmitButton
                          idleLabel="Archive"
                          pendingLabel="Archiving..."
                          className="inline-flex min-h-9 items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 text-xs font-medium text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </form>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="text-ink-muted mt-3 flex flex-wrap items-center gap-4 text-xs">
                <span>Inventory: {getInventoryLabel(product)}</span>
                <span>
                  Category: {product.categoryName ?? "Not assigned"}
                </span>
                <span>
                  Images: {product.galleryImages.length + (product.thumbnailUrl ? 1 : 0)}
                </span>
                <span>
                  Updated: {new Date(product.updatedAt).toLocaleDateString()}
                </span>
                {product.publishedAt ? (
                  <span>
                    Published:{" "}
                    {new Date(product.publishedAt).toLocaleDateString()}
                  </span>
                ) : null}
                {product.status === "suspended" ? (
                  <span className="text-red-700">
                    This product is locked until an admin reactivates it.
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
