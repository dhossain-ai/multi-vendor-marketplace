import type { Metadata } from "next";
import { requireSellerRole, requireApprovedSeller } from "@/lib/auth/guards";
import { readSearchParam } from "@/lib/auth/navigation";
import { createProductAction } from "@/features/seller/lib/seller-actions";
import { SellerProductForm } from "@/features/seller/components/seller-product-form";

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
  requireApprovedSeller(session);

  const search = await searchParams;

  return (
    <SellerProductForm
      mode="create"
      error={readSearchParam(search.error)}
      action={createProductAction}
    />
  );
}
