import type { Metadata } from "next";
import { requireSellerRole } from "@/lib/auth/guards";
import { SellerStatusGate } from "@/features/seller/components/seller-status-gate";
import { getSellerOrders } from "@/features/seller/lib/seller-order-repository";
import { SellerOrdersView } from "@/features/seller/components/seller-orders-view";

export const metadata: Metadata = {
  title: "Your Orders — Seller Dashboard",
  description: "View orders containing your products.",
};

export default async function SellerOrdersPage() {
  const session = await requireSellerRole("/seller/orders");
  const sellerProfileId = session.sellerProfile?.id;
  const sellerStatus = session.sellerProfile?.status ?? null;

  if (sellerStatus !== "approved" || !sellerProfileId) {
    return <SellerStatusGate status={sellerStatus} />;
  }

  const orders = await getSellerOrders(sellerProfileId);

  return <SellerOrdersView orders={orders} />;
}
