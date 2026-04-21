import type { Metadata } from "next";
import { requireSellerRole } from "@/lib/auth/guards";
import { readSearchParam } from "@/lib/auth/navigation";
import { SellerStatusGate } from "@/features/seller/components/seller-status-gate";
import { getSellerProducts } from "@/features/seller/lib/seller-product-repository";
import { SellerProductsView } from "@/features/seller/components/seller-products-view";

type SellerProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Your Products — Seller Dashboard",
  description: "Manage your product inventory.",
};

export default async function SellerProductsPage({
  searchParams,
}: SellerProductsPageProps) {
  const session = await requireSellerRole("/seller/products");
  const search = await searchParams;
  const sellerProfileId = session.sellerProfile?.id;
  const sellerStatus = session.sellerProfile?.status ?? null;

  if (sellerStatus !== "approved" || !sellerProfileId) {
    return <SellerStatusGate status={sellerStatus} />;
  }

  const products = await getSellerProducts(sellerProfileId);

  return (
    <SellerProductsView
      products={products}
      notice={readSearchParam(search.notice)}
      error={readSearchParam(search.error)}
    />
  );
}
