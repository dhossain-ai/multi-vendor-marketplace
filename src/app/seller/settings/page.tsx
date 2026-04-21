import type { Metadata } from "next";
import { readSearchParam } from "@/lib/auth/navigation";
import { requireSellerRole } from "@/lib/auth/guards";
import { SellerStoreSetupView } from "@/features/seller/components/seller-store-setup-view";
import {
  createSellerApplicationAction,
  updateSellerProfileAction,
} from "@/features/seller/lib/seller-actions";

type SellerSettingsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Store Settings — Seller Dashboard",
  description: "Manage your store profile and seller approval details.",
};

export default async function SellerSettingsPage({
  searchParams,
}: SellerSettingsPageProps) {
  const session = await requireSellerRole("/seller/settings");
  const search = await searchParams;
  const sellerProfile = session.sellerProfile;

  return (
    <SellerStoreSetupView
      mode={sellerProfile ? "edit" : "apply"}
      sellerProfile={sellerProfile}
      notice={readSearchParam(search.notice)}
      error={readSearchParam(search.error)}
      action={sellerProfile ? updateSellerProfileAction : createSellerApplicationAction}
    />
  );
}
