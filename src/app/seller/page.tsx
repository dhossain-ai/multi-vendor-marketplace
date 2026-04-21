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
  const sellerProfile = session.sellerProfile;
  const summary =
    sellerProfile?.status === "approved"
      ? await getSellerDashboardSummary(sellerProfile.id)
      : null;

  return (
    <SellerDashboardView
      sellerProfile={sellerProfile}
      summary={summary}
    />
  );
}
