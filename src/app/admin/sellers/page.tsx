import type { Metadata } from "next";
import { readSearchParam } from "@/lib/auth/navigation";
import { AdminSellersView } from "@/features/admin/components/admin-sellers-view";
import { getAdminSellers } from "@/features/admin/lib/admin-seller-repository";
import type { AdminSellerStatus } from "@/features/admin/types";

type AdminSellersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const isSellerStatus = (value: string | null): value is AdminSellerStatus =>
  value === "pending" ||
  value === "approved" ||
  value === "rejected" ||
  value === "suspended";

export const metadata: Metadata = {
  title: "Admin Sellers",
  description: "Review and moderate marketplace sellers.",
};

export default async function AdminSellersPage({
  searchParams,
}: AdminSellersPageProps) {
  const search = await searchParams;
  const statusParam = readSearchParam(search.status);
  const status = isSellerStatus(statusParam) ? statusParam : null;
  const sellers = await getAdminSellers(status);

  return (
    <AdminSellersView
      sellers={sellers}
      currentStatus={status}
      notice={readSearchParam(search.notice)}
      error={readSearchParam(search.error)}
    />
  );
}
