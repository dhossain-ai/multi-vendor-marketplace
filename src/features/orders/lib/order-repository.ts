import type { Json } from "@/types/database";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseServiceRoleEnv } from "@/lib/config/env";
import type {
  CustomerOrderDetail,
  CustomerOrderItem,
  CustomerOrderSummary,
  OrderItemSnapshotMetadata,
} from "@/features/orders/types";

type OrderSummaryRow = {
  id?: string | null;
  order_number?: string | null;
  order_status?: CustomerOrderSummary["orderStatus"] | null;
  payment_status?: CustomerOrderSummary["paymentStatus"] | null;
  currency_code?: string | null;
  total_amount?: number | string | null;
  placed_at?: string | null;
  created_at?: string | null;
  order_items?: Array<{ id?: string | null; quantity?: number | null }> | null;
};

type OrderItemRow = {
  id?: string | null;
  product_id?: string | null;
  seller_id?: string | null;
  product_title_snapshot?: string | null;
  product_slug_snapshot?: string | null;
  unit_price_amount?: number | string | null;
  quantity?: number | null;
  line_subtotal_amount?: number | string | null;
  discount_amount?: number | string | null;
  line_total_amount?: number | string | null;
  currency_code?: string | null;
  product_metadata_snapshot?: Json | null;
  created_at?: string | null;
};

type OrderDetailRow = {
  id?: string | null;
  order_number?: string | null;
  order_status?: CustomerOrderDetail["orderStatus"] | null;
  payment_status?: CustomerOrderDetail["paymentStatus"] | null;
  currency_code?: string | null;
  subtotal_amount?: number | string | null;
  discount_amount?: number | string | null;
  tax_amount?: number | string | null;
  total_amount?: number | string | null;
  placed_at?: string | null;
  created_at?: string | null;
  order_items?: OrderItemRow[] | null;
};

const getOrdersClient = async () =>
  hasSupabaseServiceRoleEnv()
    ? createSupabaseAdminClient()
    : createSupabaseServerClient();

const mapOrderSummary = (row: OrderSummaryRow): CustomerOrderSummary | null => {
  if (
    !row.id ||
    !row.order_number ||
    !row.order_status ||
    !row.payment_status ||
    !row.currency_code ||
    row.total_amount == null ||
    !row.created_at
  ) {
    return null;
  }

  return {
    id: row.id,
    orderNumber: row.order_number,
    orderStatus: row.order_status,
    paymentStatus: row.payment_status,
    itemCount: (row.order_items ?? []).reduce(
      (count, item) => count + (item.quantity ?? 0),
      0,
    ),
    currencyCode: row.currency_code,
    totalAmount: Number(row.total_amount),
    placedAt: row.placed_at ?? null,
    createdAt: row.created_at,
  };
};

const mapOrderItem = (row: OrderItemRow): CustomerOrderItem | null => {
  if (
    !row.id ||
    !row.seller_id ||
    !row.product_title_snapshot ||
    row.unit_price_amount == null ||
    row.quantity == null ||
    row.line_subtotal_amount == null ||
    row.discount_amount == null ||
    row.line_total_amount == null ||
    !row.currency_code ||
    !row.created_at
  ) {
    return null;
  }

  const metadata =
    row.product_metadata_snapshot &&
    typeof row.product_metadata_snapshot === "object" &&
    !Array.isArray(row.product_metadata_snapshot)
      ? (row.product_metadata_snapshot as OrderItemSnapshotMetadata)
      : {};

  return {
    id: row.id,
    productId: row.product_id ?? null,
    sellerId: row.seller_id,
    productTitle: row.product_title_snapshot,
    productSlug: row.product_slug_snapshot ?? null,
    unitPriceAmount: Number(row.unit_price_amount),
    quantity: row.quantity,
    lineSubtotalAmount: Number(row.line_subtotal_amount),
    discountAmount: Number(row.discount_amount),
    lineTotalAmount: Number(row.line_total_amount),
    currencyCode: row.currency_code,
    metadata,
    createdAt: row.created_at,
  };
};

const mapOrderDetail = (row: OrderDetailRow): CustomerOrderDetail | null => {
  if (
    !row.id ||
    !row.order_number ||
    !row.order_status ||
    !row.payment_status ||
    !row.currency_code ||
    row.subtotal_amount == null ||
    row.discount_amount == null ||
    row.tax_amount == null ||
    row.total_amount == null ||
    !row.created_at
  ) {
    return null;
  }

  const items = (row.order_items ?? [])
    .map(mapOrderItem)
    .filter((item): item is CustomerOrderItem => Boolean(item));

  return {
    id: row.id,
    orderNumber: row.order_number,
    orderStatus: row.order_status,
    paymentStatus: row.payment_status,
    itemCount: items.reduce((count, item) => count + item.quantity, 0),
    currencyCode: row.currency_code,
    totalAmount: Number(row.total_amount),
    placedAt: row.placed_at ?? null,
    createdAt: row.created_at,
    subtotalAmount: Number(row.subtotal_amount),
    discountAmount: Number(row.discount_amount),
    taxAmount: Number(row.tax_amount),
    items,
  };
};

export async function getCustomerOrders(userId: string) {
  const client = await getOrdersClient();
  const { data, error } = await client
    .from("orders")
    .select(
      `
        id,
        order_number,
        order_status,
        payment_status,
        currency_code,
        total_amount,
        placed_at,
        created_at,
        order_items (
          id,
          quantity
        )
      `,
    )
    .eq("customer_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load customer orders.");
  }

  return (data as OrderSummaryRow[])
    .map(mapOrderSummary)
    .filter((order): order is CustomerOrderSummary => Boolean(order));
}

export async function getCustomerOrderById(userId: string, orderId: string) {
  const client = await getOrdersClient();
  const { data, error } = await client
    .from("orders")
    .select(
      `
        id,
        order_number,
        order_status,
        payment_status,
        currency_code,
        subtotal_amount,
        discount_amount,
        tax_amount,
        total_amount,
        placed_at,
        created_at,
        order_items (
          id,
          product_id,
          seller_id,
          product_title_snapshot,
          product_slug_snapshot,
          unit_price_amount,
          quantity,
          line_subtotal_amount,
          discount_amount,
          line_total_amount,
          currency_code,
          product_metadata_snapshot,
          created_at
        )
      `,
    )
    .eq("customer_id", userId)
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load that order.");
  }

  return data ? mapOrderDetail(data as OrderDetailRow) : null;
}
