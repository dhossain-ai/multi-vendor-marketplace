import type { Metadata } from "next";
import { requireSellerRole } from "@/lib/auth/guards";
import { readSearchParam } from "@/lib/auth/navigation";
import { SellerStatusGate } from "@/features/seller/components/seller-status-gate";
import { createProductAction } from "@/features/seller/lib/seller-actions";
import { SellerProductForm } from "@/features/seller/components/seller-product-form";
import { getActiveCategoryOptions } from "@/features/shared/lib/category-repository";

type NewProductPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "New Product — Seller Dashboard",
  description: "Create a new product.",
};

export default async function NewProductPage({
  searchParams,
}: NewProductPageProps) {
  const session = await requireSellerRole("/seller/products/new");
  const search = await searchParams;
  const sellerStatus = session.sellerProfile?.status ?? null;

  if (sellerStatus !== "approved") {
    return <SellerStatusGate status={sellerStatus} />;
  }

  const categories = await getActiveCategoryOptions();

  return (
    <SellerProductForm
      mode="create"
      categories={categories}
      error={readSearchParam(search.error)}
      action={createProductAction}
    />
  );
}
