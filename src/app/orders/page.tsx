import type { Metadata } from "next";
import { OrdersListView } from "@/features/orders/components/orders-list-view";
import { getCustomerOrders } from "@/features/orders/lib/order-repository";
import { readSearchParam } from "@/lib/auth/navigation";
import { requireAuthenticatedUser } from "@/lib/auth/guards";

type OrdersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Orders",
  description: "Track your recent marketplace orders.",
};

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const search = await searchParams;
  const session = await requireAuthenticatedUser("/orders");
  const orders = await getCustomerOrders(session.user.id);

  return (
    <OrdersListView
      orders={orders}
      notice={readSearchParam(search.notice)}
    />
  );
}
