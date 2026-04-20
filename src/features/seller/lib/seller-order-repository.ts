import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseServiceRoleEnv } from "@/lib/config/env";
import type { Json } from "@/types/database";
import type { SellerOrderItem } from "@/features/seller/types";

const getSellerClient = async () =>
  hasSupabaseServiceRoleEnv()
    ? createSupabaseAdminClient()
    : createSupabaseServerClient();

type OrderItemRow = {
  id: string;
  order_id: string;
  product_title_snapshot: string;
  product_slug_snapshot: string | null;
  unit_price_amount: number;
  quantity: number;
  line_total_amount: number;
  currency_code: string;
  product_metadata_snapshot: Json;
  created_at: string;
};

type OrderRow = {
  id: string;
  order_number: string;
  order_status: string;
  payment_status: string;
  placed_at: string | null;
};

/**
 * Get seller-scoped order items. Seller sees only their own line items.
 * Uses two queries to avoid join type issues with hand-written DB types.
 */
export async function getSellerOrders(
  sellerProfileId: string,
): Promise<SellerOrderItem[]> {
  const client = await getSellerClient();

  // Get seller's order items
  const { data: items, error: itemsError } = await client
    .from("order_items")
    .select(
      "id, order_id, product_title_snapshot, product_slug_snapshot, unit_price_amount, quantity, line_total_amount, currency_code, product_metadata_snapshot, created_at",
    )
    .eq("seller_id", sellerProfileId)
    .order("created_at", { ascending: false });

  if (itemsError) {
    throw new Error("Unable to load seller orders.");
  }

  const allItems = (items ?? []) as OrderItemRow[];

  if (allItems.length === 0) {
    return [];
  }

  // Get parent order data
  const orderIds = [...new Set(allItems.map((item) => item.order_id))];

  const { data: orders, error: ordersError } = await client
    .from("orders")
    .select("id, order_number, order_status, payment_status, placed_at")
    .in("id", orderIds);

  if (ordersError) {
    throw new Error("Unable to load parent order data.");
  }

  const orderMap = new Map(
    ((orders ?? []) as OrderRow[]).map((o) => [o.id, o]),
  );

  return allItems
    .map((item) => {
      const order = orderMap.get(item.order_id);

      if (!order) {
        return null;
      }

      const metadata =
        item.product_metadata_snapshot &&
        typeof item.product_metadata_snapshot === "object" &&
        !Array.isArray(item.product_metadata_snapshot)
          ? (item.product_metadata_snapshot as Record<string, unknown>)
          : {};

      return {
        id: item.id,
        orderId: item.order_id,
        orderNumber: order.order_number,
        orderStatus: order.order_status,
        paymentStatus: order.payment_status,
        productTitle: item.product_title_snapshot,
        productSlug: item.product_slug_snapshot,
        unitPriceAmount: Number(item.unit_price_amount),
        quantity: item.quantity,
        lineTotalAmount: Number(item.line_total_amount),
        currencyCode: item.currency_code,
        metadata,
        orderPlacedAt: order.placed_at,
        createdAt: item.created_at,
      } satisfies SellerOrderItem;
    })
    .filter((item): item is SellerOrderItem => Boolean(item));
}
