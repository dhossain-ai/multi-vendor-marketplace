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
              Your products
            </p>
            <h1 className="text-foreground mt-1 text-4xl font-semibold tracking-tight">
              Product management
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
          Create, edit, publish, and archive your products. Price changes only
          affect future sales — existing orders keep their snapshot values.
        </p>
      </div>

      {error ? <AuthMessage tone="error" message={error} /> : null}
      {notice && !error ? <AuthMessage tone="success" message={notice} /> : null}

      {products.length === 0 ? (
        <div className="border-border bg-panel rounded-[2rem] border p-10 text-center shadow-[var(--shadow-panel)]">
          <h2 className="text-foreground text-3xl font-semibold tracking-tight">
            No products yet
          </h2>
          <p className="text-ink-muted mx-auto mt-4 max-w-2xl text-sm leading-7">
            You haven&apos;t created any products. Add your first product to start
            selling on the marketplace.
          </p>
          <div className="mt-8">
            <Link
              href="/seller/products/new"
              className="bg-brand inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-white"
            >
              Create first product
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
                    <Link
                      href={`/seller/products/${product.id}/edit`}
                      className="border-border bg-panel-muted text-foreground inline-flex min-h-9 items-center justify-center rounded-full border px-4 text-xs font-medium"
                    >
                      Edit
                    </Link>
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
                <span>
                  Stock:{" "}
                  {product.isUnlimitedStock
                    ? "Unlimited"
                    : product.stockQuantity ?? "Not set"}
                </span>
                <span>
                  Created: {new Date(product.createdAt).toLocaleDateString()}
                </span>
                {product.publishedAt ? (
                  <span>
                    Published:{" "}
                    {new Date(product.publishedAt).toLocaleDateString()}
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
