import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readSearchParam } from "@/lib/auth/navigation";
import { AdminSellerDetailView } from "@/features/admin/components/admin-seller-detail-view";
import { getAdminSellerById } from "@/features/admin/lib/admin-seller-repository";

type AdminSellerDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: AdminSellerDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const seller = await getAdminSellerById(id);

  if (!seller) {
    return { title: "Seller Not Found" };
  }

  return {
    title: `Review Seller: ${seller.storeName}`,
    description: `Admin moderation for seller ${seller.storeName}`,
  };
}

export default async function AdminSellerDetailPage({
  params,
  searchParams,
}: AdminSellerDetailPageProps) {
  const { id } = await params;
  const search = await searchParams;
  const seller = await getAdminSellerById(id);

  if (!seller) {
    notFound();
  }

  return (
    <AdminSellerDetailView
      seller={seller}
      notice={readSearchParam(search.notice)}
      error={readSearchParam(search.error)}
    />
  );
}
