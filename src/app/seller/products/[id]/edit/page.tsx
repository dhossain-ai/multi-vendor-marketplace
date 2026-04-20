import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSellerRole, requireApprovedSeller } from "@/lib/auth/guards";
import { readSearchParam } from "@/lib/auth/navigation";
import { getSellerProductById } from "@/features/seller/lib/seller-product-repository";
import { updateProductAction } from "@/features/seller/lib/seller-actions";
import { SellerProductForm } from "@/features/seller/components/seller-product-form";

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
  requireApprovedSeller(session);

  const { id } = await params;
  const search = await searchParams;
  const sellerProfileId = session.sellerProfile?.id;

  if (!sellerProfileId) {
    notFound();
  }

  const product = await getSellerProductById(sellerProfileId, id);

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
      error={readSearchParam(search.error)}
      action={boundUpdateAction}
    />
  );
}
