import { getAdminDataClient } from "@/features/admin/lib/admin-client";
import type { AdminDashboardSummary } from "@/features/admin/types";

const RECENT_ORDERS_WINDOW_DAYS = 7;

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const client = await getAdminDataClient();
  const recentCutoff = new Date();
  recentCutoff.setDate(recentCutoff.getDate() - RECENT_ORDERS_WINDOW_DAYS);

  const [
    customersResult,
    sellersResult,
    pendingSellersResult,
    activeProductsResult,
    recentOrdersResult,
    paidOrdersResult,
  ] = await Promise.all([
    client
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "customer"),
    client.from("seller_profiles").select("*", { count: "exact", head: true }),
    client
      .from("seller_profiles")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    client
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    client
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", recentCutoff.toISOString()),
    client
      .from("orders")
      .select("total_amount, currency_code")
      .eq("payment_status", "paid"),
  ]);

  if (
    customersResult.error ||
    sellersResult.error ||
    pendingSellersResult.error ||
    activeProductsResult.error ||
    recentOrdersResult.error ||
    paidOrdersResult.error
  ) {
    throw new Error("Unable to load the admin dashboard summary.");
  }

  const paidOrders =
    (paidOrdersResult.data as
      | Array<{ total_amount?: number | string | null; currency_code?: string | null }>
      | null) ?? [];

  return {
    totalCustomers: customersResult.count ?? 0,
    totalSellers: sellersResult.count ?? 0,
    pendingSellerApplications: pendingSellersResult.count ?? 0,
    activeProducts: activeProductsResult.count ?? 0,
    recentOrdersCount: recentOrdersResult.count ?? 0,
    grossRevenueAmount: paidOrders.reduce(
      (sum, order) => sum + Number(order.total_amount ?? 0),
      0,
    ),
    currencyCode: paidOrders[0]?.currency_code ?? "USD",
  };
}
