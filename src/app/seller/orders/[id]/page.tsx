import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readSearchParam } from "@/lib/auth/navigation";
import { requireSellerRole } from "@/lib/auth/guards";
import { SellerStatusGate } from "@/features/seller/components/seller-status-gate";
import { SellerOrderDetailView } from "@/features/seller/components/seller-order-detail-view";
import { getSellerOrderById } from "@/features/seller/lib/seller-order-repository";

type SellerOrderDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: SellerOrderDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Seller Order ${id}`,
  };
}

export default async function SellerOrderDetailPage({
  params,
  searchParams,
}: SellerOrderDetailPageProps) {
  const session = await requireSellerRole("/seller/orders");
  const sellerProfileId = session.sellerProfile?.id;
  const sellerStatus = session.sellerProfile?.status ?? null;
  const { id } = await params;
  const search = await searchParams;

  if (sellerStatus !== "approved" || !sellerProfileId) {
    return <SellerStatusGate status={sellerStatus} />;
  }

  const order = await getSellerOrderById(sellerProfileId, id);

  if (!order) {
    notFound();
  }

  return (
    <SellerOrderDetailView
      order={order}
      notice={readSearchParam(search.notice)}
      error={readSearchParam(search.error)}
    />
  );
}
