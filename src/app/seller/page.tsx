import type { Metadata } from "next";
import { requireSellerRole } from "@/lib/auth/guards";
import { getSellerDashboardSummary } from "@/features/seller/lib/seller-dashboard-repository";
import { SellerDashboardView } from "@/features/seller/components/seller-dashboard-view";

export const metadata: Metadata = {
  title: "Seller Dashboard",
  description: "Manage your store and view performance.",
};

export default async function SellerPage() {
  const session = await requireSellerRole("/seller");
  const sellerProfileId = session.sellerProfile?.id;

  if (!sellerProfileId || !session.sellerProfile) {
    return null;
  }

  const summary = await getSellerDashboardSummary(sellerProfileId);

  return (
    <SellerDashboardView
      summary={summary}
      storeName={session.sellerProfile.storeName}
    />
  );
}
