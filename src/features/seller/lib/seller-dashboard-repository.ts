import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseServiceRoleEnv } from "@/lib/config/env";
import type { SellerDashboardSummary } from "@/features/seller/types";

const getSellerClient = async () =>
  hasSupabaseServiceRoleEnv()
    ? createSupabaseAdminClient()
    : createSupabaseServerClient();

/**
 * Aggregate dashboard summary for the seller.
 * All queries scoped by sellerProfileId.
 *
 * Uses two queries instead of a join because the hand-written Database type
 * doesn't include Relationships metadata, which makes join syntax produce `never`.
 */
export async function getSellerDashboardSummary(
  sellerProfileId: string,
): Promise<SellerDashboardSummary> {
  const client = await getSellerClient();

  // Product counts by status
  const { data: products, error: productsError } = await client
    .from("products")
    .select("id, status")
    .eq("seller_id", sellerProfileId);

  if (productsError) {
    throw new Error("Unable to load seller product summary.");
  }

  const allProducts = products ?? [];
  const totalProducts = allProducts.length;
  const activeProducts = allProducts.filter((p) => p.status === "active").length;
  const draftProducts = allProducts.filter((p) => p.status === "draft").length;
  const archivedProducts = allProducts.filter((p) => p.status === "archived").length;

  // Seller order items — get all, then cross-check with paid orders
  const { data: orderItems, error: itemsError } = await client
    .from("order_items")
    .select("order_id, line_total_amount, currency_code")
    .eq("seller_id", sellerProfileId);

  if (itemsError) {
    throw new Error("Unable to load seller order items.");
  }

  const allItems = orderItems ?? [];

  if (allItems.length === 0) {
    return {
      totalProducts,
      activeProducts,
      draftProducts,
      archivedProducts,
      totalOrderItems: 0,
      grossSalesAmount: 0,
      currencyCode: "USD",
    };
  }

  // Get unique order IDs that are paid
  const orderIds = [...new Set(allItems.map((item) => item.order_id))];

  const { data: paidOrders, error: ordersError } = await client
    .from("orders")
    .select("id")
    .in("id", orderIds)
    .eq("payment_status", "paid");

  if (ordersError) {
    throw new Error("Unable to load paid order data.");
  }

  const paidOrderIds = new Set((paidOrders ?? []).map((o) => o.id));

  const paidItems = allItems.filter((item) => paidOrderIds.has(item.order_id));
  const totalOrderItems = paidItems.length;
  const grossSalesAmount = paidItems.reduce(
    (sum, item) => sum + Number(item.line_total_amount ?? 0),
    0,
  );

  return {
    totalProducts,
    activeProducts,
    draftProducts,
    archivedProducts,
    totalOrderItems,
    grossSalesAmount,
    currencyCode: "USD",
  };
}
