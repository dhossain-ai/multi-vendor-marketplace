import type { Metadata } from "next";
import { readSearchParam } from "@/lib/auth/navigation";
import { AdminOrdersView } from "@/features/admin/components/admin-orders-view";
import { getAdminOrders } from "@/features/admin/lib/admin-order-repository";
import type { AdminOrderStatus, AdminPaymentStatus } from "@/features/admin/types";

type AdminOrdersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const isOrderStatus = (value: string | null): value is AdminOrderStatus =>
  value === "pending" ||
  value === "confirmed" ||
  value === "processing" ||
  value === "completed" ||
  value === "cancelled" ||
  value === "refunded" ||
  value === "partially_refunded";

const isPaymentStatus = (value: string | null): value is AdminPaymentStatus =>
  value === "unpaid" ||
  value === "processing" ||
  value === "paid" ||
  value === "failed" ||
  value === "refunded" ||
  value === "partially_refunded";

export const metadata: Metadata = {
  title: "Admin Orders",
  description: "Monitor platform-wide orders and payment states.",
};

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const search = await searchParams;
  const orderStatusParam = readSearchParam(search.orderStatus);
  const paymentStatusParam = readSearchParam(search.paymentStatus);
  const orderStatus = isOrderStatus(orderStatusParam) ? orderStatusParam : null;
  const paymentStatus = isPaymentStatus(paymentStatusParam)
    ? paymentStatusParam
    : null;
  const orders = await getAdminOrders({
    orderStatus,
    paymentStatus,
  });

  return (
    <AdminOrdersView
      orders={orders}
      currentOrderStatus={orderStatus}
      currentPaymentStatus={paymentStatus}
      notice={readSearchParam(search.notice)}
      error={readSearchParam(search.error)}
    />
  );
}
