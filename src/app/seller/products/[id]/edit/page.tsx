import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSellerRole } from "@/lib/auth/guards";
import { readSearchParam } from "@/lib/auth/navigation";
import { SellerStatusGate } from "@/features/seller/components/seller-status-gate";
import { getSellerProductById } from "@/features/seller/lib/seller-product-repository";
import { updateProductAction } from "@/features/seller/lib/seller-actions";
import { SellerProductForm } from "@/features/seller/components/seller-product-form";
import { getActiveCategoryOptions } from "@/features/shared/lib/category-repository";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: EditProductPageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Edit Product ${id.slice(0, 8)} — Seller Dashboard`,
  };
}

export default async function EditProductPage({
  params,
  searchParams,
}: EditProductPageProps) {
  const session = await requireSellerRole("/seller/products");
  const { id } = await params;
  const search = await searchParams;
  const sellerProfileId = session.sellerProfile?.id;
  const sellerStatus = session.sellerProfile?.status ?? null;

  if (sellerStatus !== "approved" || !sellerProfileId) {
    return <SellerStatusGate status={sellerStatus} />;
  }

  const product = await getSellerProductById(sellerProfileId, id);
  const categories = await getActiveCategoryOptions();

  if (!product) {
    notFound();
  }

  const boundUpdateAction = async (formData: FormData) => {
    "use server";
    await updateProductAction(id, formData);
  };

  return (
    <SellerProductForm
      mode="edit"
      product={product}
      categories={categories}
      error={readSearchParam(search.error)}
      action={boundUpdateAction}
    />
  );
}
