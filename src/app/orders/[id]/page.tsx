import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderDetailView } from "@/features/orders/components/order-detail-view";
import { getCustomerOrderById } from "@/features/orders/lib/order-repository";
import { readSearchParam } from "@/lib/auth/navigation";
import { requireAuthenticatedUser } from "@/lib/auth/guards";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: OrderDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Order ${id}`,
  };
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: OrderDetailPageProps) {
  const { id } = await params;
  const search = await searchParams;
  const session = await requireAuthenticatedUser(`/orders/${id}`);
  const order = await getCustomerOrderById(session.user.id, id);

  if (!order) {
    notFound();
  }

  return (
    <OrderDetailView
      order={order}
      notice={readSearchParam(search.notice)}
    />
  );
}
