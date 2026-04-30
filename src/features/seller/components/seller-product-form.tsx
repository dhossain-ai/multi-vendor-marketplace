"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { AuthMessage } from "@/features/auth/components/auth-message";
import type {
  SellerProduct,
  SellerProductFormCategory,
} from "@/features/seller/types";

type SellerProductFormProps = {
  mode: "create" | "edit";
  product?: SellerProduct | null;
  categories: SellerProductFormCategory[];
  error?: string | null;
  action: (formData: FormData) => Promise<void>;
};

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-brand inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending
        ? mode === "create"
          ? "Creating..."
          : "Saving..."
        : mode === "create"
          ? "Create product"
          : "Save changes"}
    </button>
  );
}

export function SellerProductForm({
  mode,
  product,
  categories,
  error,
  action,
}: SellerProductFormProps) {
  const hasActiveCategories = categories.length > 0;
  const selectedCategoryMissing =
    Boolean(product?.categoryId) &&
    !categories.some((category) => category.id === product?.categoryId);
  const galleryDefaults = product?.galleryImages.map((image) => image.url).join("\n") ?? "";

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
          {mode === "create" ? "New product" : "Edit product"}
        </p>
        <h1 className="text-foreground text-4xl font-semibold tracking-tight">
          {mode === "create" ? "Add a product" : product?.title ?? "Edit product"}
        </h1>
        <p className="text-ink-muted max-w-3xl text-sm leading-7">
          {mode === "create"
            ? "Fill in the details below to launch a new listing. You can save as draft or publish right away."
            : "Update your listing details. Price changes only affect future purchases."}
        </p>
      </div>

      {error ? <AuthMessage tone="error" message={error} /> : null}

      <form action={action} className="space-y-6">
        <div className="border-border bg-panel rounded-[2rem] border p-6 shadow-[var(--shadow-panel)]">
          <div className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-foreground text-sm font-medium"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                minLength={2}
                maxLength={200}
                defaultValue={product?.title ?? ""}
                className="border-border bg-panel-muted text-foreground block w-full rounded-xl border px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
                placeholder="Product title"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="slug"
                className="text-foreground text-sm font-medium"
              >
                Slug
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                required
                minLength={2}
                maxLength={200}
                defaultValue={product?.slug ?? ""}
                className="border-border bg-panel-muted text-foreground block w-full rounded-xl border px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
                placeholder="product-slug"
              />
              <p className="text-ink-muted text-xs">
                URL-friendly identifier. Lowercase letters, numbers, and hyphens
                only.
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="shortDescription"
                className="text-foreground text-sm font-medium"
              >
                Short description
              </label>
              <input
                type="text"
                id="shortDescription"
                name="shortDescription"
                maxLength={300}
                defaultValue={product?.shortDescription ?? ""}
                className="border-border bg-panel-muted text-foreground block w-full rounded-xl border px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
                placeholder="Brief product summary"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-foreground text-sm font-medium"
              >
                Full description
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                defaultValue={product?.description ?? ""}
                className="border-border bg-panel-muted text-foreground block w-full rounded-xl border px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
                placeholder="Detailed product description"
              />
            </div>
          </div>
        </div>

        <div className="border-border bg-panel rounded-[2rem] border p-6 shadow-[var(--shadow-panel)]">
          <div className="space-y-5">
            <div className="space-y-2">
              <h2 className="text-foreground text-xl font-semibold">
                Pricing and stock
              </h2>
              <p className="text-ink-muted text-sm leading-7">
                Set the price customers will see and the stock rules that control whether an item can keep selling.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="priceAmount"
                  className="text-foreground text-sm font-medium"
                >
                  Price
                </label>
                <input
                  type="number"
                  id="priceAmount"
                  name="priceAmount"
                  required
                  min="0.01"
                  max="999999"
                  step="0.01"
                  defaultValue={product?.priceAmount ?? ""}
                  className="border-border bg-panel-muted text-foreground block w-full rounded-xl border px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
                  placeholder="29.99"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="currencyCode"
                  className="text-foreground text-sm font-medium"
                >
                  Currency
                </label>
                <select
                  id="currencyCode"
                  name="currencyCode"
                  defaultValue={product?.currencyCode ?? "USD"}
                  className="border-border bg-panel-muted text-foreground block w-full rounded-xl border px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="stockQuantity"
                  className="text-foreground text-sm font-medium"
                >
                  Stock quantity
                </label>
                <input
                  type="number"
                  id="stockQuantity"
                  name="stockQuantity"
                  min="0"
                  defaultValue={product?.stockQuantity ?? ""}
                  className="border-border bg-panel-muted text-foreground block w-full rounded-xl border px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
                  placeholder="100"
                />
                <p className="text-ink-muted text-xs">
                  Use a numeric stock count for limited inventory. Leave unlimited stock on for made-to-order or always-available items.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-xl border border-border bg-panel-muted px-4 py-3">
                  <input
                    type="checkbox"
                    id="isUnlimitedStock"
                    name="isUnlimitedStock"
                    defaultChecked={product?.isUnlimitedStock ?? true}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label
                    htmlFor="isUnlimitedStock"
                    className="text-foreground text-sm font-medium"
                  >
                    Unlimited stock
                  </label>
                </div>
                <p className="text-ink-muted text-xs">
                  Turn this on if you do not want stock levels to limit purchases.
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="lowStockThreshold"
                  className="text-foreground text-sm font-medium"
                >
                  Low-stock threshold
                </label>
                <input
                  type="number"
                  id="lowStockThreshold"
                  name="lowStockThreshold"
                  min="0"
                  defaultValue={product?.lowStockThreshold ?? 5}
                  className="border-border bg-panel-muted text-foreground block w-full rounded-xl border px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
                  placeholder="5"
                />
                <p className="text-ink-muted text-xs">
                  Show a low-stock warning when inventory drops to this number.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-border bg-panel rounded-[2rem] border p-6 shadow-[var(--shadow-panel)]">
          <div className="space-y-5">
            <div className="space-y-2">
              <h2 className="text-foreground text-xl font-semibold">
                Merchandising
              </h2>
              <p className="text-ink-muted text-sm leading-7">
                Place the product in the right category and add images shoppers can trust before you publish it.
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="status"
                className="text-foreground text-sm font-medium"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={
                  product?.status === "active" ? "active" : "draft"
                }
                className="border-border bg-panel-muted text-foreground block w-full rounded-xl border px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
              >
                <option value="draft">Draft — not visible to customers</option>
                <option value="active">
                  Active — visible and purchasable
                </option>
              </select>
              <p className="text-ink-muted text-xs">
                Draft products stay private to your store tools. Active products appear in the storefront for customers.
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="categoryId"
                className="text-foreground text-sm font-medium"
              >
                Category
              </label>
              <select
                id="categoryId"
                name="categoryId"
                defaultValue={product?.categoryId ?? ""}
                className="border-border bg-panel-muted text-foreground block w-full rounded-xl border px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
              >
                <option value="">
                  {hasActiveCategories ? "Choose a category" : "No active categories available"}
                </option>
                {selectedCategoryMissing ? (
                  <option value={product?.categoryId ?? ""}>
                    {product?.categoryName ?? "Current category"} (inactive)
                  </option>
                ) : null}
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {hasActiveCategories ? (
                <p className="text-ink-muted text-xs">
                  Categories come from the active marketplace category list. Active products should always be filed into the right category.
                </p>
              ) : (
                <p className="text-ink-muted text-xs">
                  No active categories are available right now. You can still save a draft, then publish after a marketplace admin enables categories.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="thumbnailUrl"
                className="text-foreground text-sm font-medium"
              >
                Thumbnail image URL
              </label>
              <input
                type="url"
                id="thumbnailUrl"
                name="thumbnailUrl"
                defaultValue={product?.thumbnailUrl ?? ""}
                className="border-border bg-panel-muted text-foreground block w-full rounded-xl border px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="galleryImageUrls"
                className="text-foreground text-sm font-medium"
              >
                Gallery image URLs
              </label>
              <textarea
                id="galleryImageUrls"
                name="galleryImageUrls"
                rows={5}
                defaultValue={galleryDefaults}
                className="border-border bg-panel-muted text-foreground block w-full rounded-xl border px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
                placeholder={"https://example.com/image-1.jpg\nhttps://example.com/image-2.jpg"}
              />
              <p className="text-ink-muted text-xs">
                Add one image URL per line. Use up to 6 gallery images to show alternate views or product details.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <SubmitButton mode={mode} />
          <Link
            href="/seller/products"
            className="border-border bg-panel-muted text-foreground inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-medium"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
