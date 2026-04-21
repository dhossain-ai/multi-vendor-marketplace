import type { Metadata } from "next";
import { readSearchParam } from "@/lib/auth/navigation";
import { AdminCouponsView } from "@/features/admin/components/admin-coupons-view";
import {
  getAdminCoupons,
  getCouponSellerOptions,
} from "@/features/admin/lib/admin-coupon-repository";

type AdminCouponsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Admin Coupons",
  description: "Manage coupon definitions and activation state.",
};

export default async function AdminCouponsPage({
  searchParams,
}: AdminCouponsPageProps) {
  const search = await searchParams;
  const [coupons, sellerOptions] = await Promise.all([
    getAdminCoupons(),
    getCouponSellerOptions(),
  ]);

  return (
    <AdminCouponsView
      coupons={coupons}
      sellerOptions={sellerOptions}
      notice={readSearchParam(search.notice)}
      error={readSearchParam(search.error)}
    />
  );
}
