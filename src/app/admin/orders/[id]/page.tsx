import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminOrderDetailView } from "@/features/admin/components/admin-order-detail-view";
import { getAdminOrderById } from "@/features/admin/lib/admin-order-repository";

type AdminOrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: AdminOrderDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Admin Order ${id}`,
  };
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) {
    notFound();
  }

  return <AdminOrderDetailView order={order} />;
}
