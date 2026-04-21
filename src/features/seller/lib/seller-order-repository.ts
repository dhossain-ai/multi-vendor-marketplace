import type { Json } from "@/types/database";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseServiceRoleEnv } from "@/lib/config/env";
import { deriveOperationalStage } from "@/features/orders/lib/order-progress";
import type {
  SellerFulfillmentUpdateInput,
  SellerOrderDetail,
  SellerOrderItem,
  SellerOrderSummary,
} from "@/features/seller/types";

type CustomerRow = {
  email?: string | null;
  full_name?: string | null;
};

type SellerOrderItemRow = {
  id?: string | null;
  order_id?: string | null;
  product_id?: string | null;
  product_title_snapshot?: string | null;
  product_slug_snapshot?: string | null;
  unit_price_amount?: number | string | null;
  quantity?: number | null;
  line_subtotal_amount?: number | string | null;
  discount_amount?: number | string | null;
  line_total_amount?: number | string | null;
  currency_code?: string | null;
  fulfillment_status?: SellerOrderItem["fulfillmentStatus"] | null;
  tracking_code?: string | null;
  shipment_note?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  product_metadata_snapshot?: Json | null;
  created_at?: string | null;
};

type SellerOrderRow = {
  id?: string | null;
  order_number?: string | null;
  order_status?: SellerOrderSummary["orderStatus"] | null;
  payment_status?: SellerOrderSummary["paymentStatus"] | null;
  placed_at?: string | null;
  created_at?: string | null;
  profiles?: CustomerRow | CustomerRow[] | null;
};

const getSellerClient = async () =>
  hasSupabaseServiceRoleEnv()
    ? createSupabaseAdminClient()
    : createSupabaseServerClient();

const normalizeJoinedRecord = <T>(value: T | T[] | null | undefined) => {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
};

const mapSellerOrderItem = (row: SellerOrderItemRow): SellerOrderItem | null => {
  if (
    !row.id ||
    !row.product_title_snapshot ||
    row.quantity == null ||
    row.unit_price_amount == null ||
    row.line_subtotal_amount == null ||
    row.discount_amount == null ||
    row.line_total_amount == null ||
    !row.currency_code ||
    !row.fulfillment_status ||
    !row.created_at
  ) {
    return null;
  }

  const metadata =
    row.product_metadata_snapshot &&
    typeof row.product_metadata_snapshot === "object" &&
    !Array.isArray(row.product_metadata_snapshot)
      ? (row.product_metadata_snapshot as Record<string, unknown>)
      : {};

  return {
    id: row.id,
    productId: row.product_id ?? null,
    productTitle: row.product_title_snapshot,
    productSlug: row.product_slug_snapshot ?? null,
    quantity: row.quantity,
    unitPriceAmount: Number(row.unit_price_amount),
    lineSubtotalAmount: Number(row.line_subtotal_amount),
    discountAmount: Number(row.discount_amount),
    lineTotalAmount: Number(row.line_total_amount),
    currencyCode: row.currency_code,
    fulfillmentStatus: row.fulfillment_status,
    trackingCode: row.tracking_code ?? null,
    shipmentNote: row.shipment_note ?? null,
    shippedAt: row.shipped_at ?? null,
    deliveredAt: row.delivered_at ?? null,
    metadata,
    createdAt: row.created_at,
  };
};

const buildSellerOrderSummary = (
  order: SellerOrderRow,
  items: SellerOrderItem[],
): SellerOrderSummary | null => {
  if (
    !order.id ||
    !order.order_number ||
    !order.order_status ||
    !order.payment_status ||
    !order.created_at
  ) {
    return null;
  }

  return {
    id: order.id,
    orderNumber: order.order_number,
    orderStatus: order.order_status,
    paymentStatus: order.payment_status,
    operationalStage: deriveOperationalStage({
      orderStatus: order.order_status,
      paymentStatus: order.payment_status,
      fulfillmentStatuses: items.map((item) => item.fulfillmentStatus),
    }),
    itemCount: items.length,
    totalQuantity: items.reduce((total, item) => total + item.quantity, 0),
    grossSalesAmount: items.reduce((total, item) => total + item.lineTotalAmount, 0),
    currencyCode: items[0]?.currencyCode ?? "USD",
    placedAt: order.placed_at ?? null,
    createdAt: order.created_at,
    items,
  };
};

const buildSellerOrderDetail = (
  order: SellerOrderRow,
  items: SellerOrderItem[],
): SellerOrderDetail | null => {
  const summary = buildSellerOrderSummary(order, items);

  if (!summary) {
    return null;
  }

  const customer = normalizeJoinedRecord(order.profiles);

  return {
    ...summary,
    customerName: customer?.full_name ?? null,
    customerEmail: customer?.email ?? null,
  };
};

async function getSellerOrderRows(sellerProfileId: string, orderId?: string) {
  const client = await getSellerClient();
  let itemQuery = client
    .from("order_items")
    .select(
      `
        id,
        order_id,
        product_id,
        product_title_snapshot,
        product_slug_snapshot,
        unit_price_amount,
        quantity,
        line_subtotal_amount,
        discount_amount,
        line_total_amount,
        currency_code,
        fulfillment_status,
        tracking_code,
        shipment_note,
        shipped_at,
        delivered_at,
        product_metadata_snapshot,
        created_at
      `,
    )
    .eq("seller_id", sellerProfileId)
    .order("created_at", { ascending: false });

  if (orderId) {
    itemQuery = itemQuery.eq("order_id", orderId);
  }

  const { data: itemData, error: itemError } = await itemQuery;

  if (itemError) {
    throw new Error("Unable to load seller order items.");
  }

  const itemRows = (itemData as SellerOrderItemRow[]) ?? [];

  if (itemRows.length === 0) {
    return {
      itemRows: [],
      orderRows: [],
    };
  }

  const orderIds = [...new Set(itemRows.flatMap((item) => (item.order_id ? [item.order_id] : [])))];
  const { data: orderData, error: orderError } = await client
    .from("orders")
    .select(
      `
        id,
        order_number,
        order_status,
        payment_status,
        placed_at,
        created_at,
        profiles!orders_customer_id_fkey (
          email,
          full_name
        )
      `,
    )
    .in("id", orderIds);

  if (orderError) {
    throw new Error("Unable to load seller order summaries.");
  }

  return {
    itemRows,
    orderRows: (orderData as SellerOrderRow[]) ?? [],
  };
}

const isAllowedTransition = (
  currentStatuses: SellerOrderItem["fulfillmentStatus"][],
  nextStatus: SellerFulfillmentUpdateInput["fulfillmentStatus"],
) => {
  switch (nextStatus) {
    case "processing":
      return currentStatuses.every(
        (status) => status === "unfulfilled" || status === "processing",
      );
    case "shipped":
      return currentStatuses.every(
        (status) =>
          status === "unfulfilled" ||
          status === "processing" ||
          status === "shipped",
      );
    case "delivered":
      return currentStatuses.every(
        (status) => status === "shipped" || status === "delivered",
      );
    case "cancelled":
      return currentStatuses.every(
        (status) =>
          status === "unfulfilled" ||
          status === "processing" ||
          status === "cancelled",
      );
    default:
      return false;
  }
};

export class SellerOrderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SellerOrderError";
  }
}

export async function getSellerOrders(
  sellerProfileId: string,
): Promise<SellerOrderSummary[]> {
  const { itemRows, orderRows } = await getSellerOrderRows(sellerProfileId);

  if (itemRows.length === 0) {
    return [];
  }

  const itemMap = new Map<string, SellerOrderItem[]>();

  itemRows.forEach((row) => {
    const mapped = mapSellerOrderItem(row);

    if (!mapped || !row.order_id) {
      return;
    }

    const existing = itemMap.get(row.order_id) ?? [];
    existing.push(mapped);
    itemMap.set(row.order_id, existing);
  });

  return orderRows
    .map((order) => buildSellerOrderSummary(order, itemMap.get(order.id ?? "") ?? []))
    .filter((order): order is SellerOrderSummary => Boolean(order))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function getSellerOrderById(
  sellerProfileId: string,
  orderId: string,
): Promise<SellerOrderDetail | null> {
  const { itemRows, orderRows } = await getSellerOrderRows(sellerProfileId, orderId);

  if (itemRows.length === 0) {
    return null;
  }

  const order = orderRows.find((candidate) => candidate.id === orderId);

  if (!order) {
    return null;
  }

  const items = itemRows
    .map(mapSellerOrderItem)
    .filter((item): item is SellerOrderItem => Boolean(item))
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt));

  return buildSellerOrderDetail(order, items);
}

export async function updateSellerOrderFulfillment(
  sellerProfileId: string,
  input: SellerFulfillmentUpdateInput,
) {
  const order = await getSellerOrderById(sellerProfileId, input.orderId);

  if (!order) {
    throw new SellerOrderError("That order could not be found for this store.");
  }

  if (order.paymentStatus !== "paid") {
    throw new SellerOrderError(
      "Fulfillment can start only after payment has been confirmed.",
    );
  }

  if (
    order.orderStatus === "cancelled" ||
    order.orderStatus === "refunded" ||
    order.orderStatus === "partially_refunded"
  ) {
    throw new SellerOrderError(
      "This order can no longer be updated from the seller dashboard.",
    );
  }

  const currentStatuses = order.items.map((item) => item.fulfillmentStatus);

  if (!isAllowedTransition(currentStatuses, input.fulfillmentStatus)) {
    throw new SellerOrderError(
      "That fulfillment update is not allowed from the current order state.",
    );
  }

  const client = await getSellerClient();
  const now = new Date().toISOString();
  const updateData: {
    fulfillment_status: SellerFulfillmentUpdateInput["fulfillmentStatus"];
    tracking_code?: string | null;
    shipment_note?: string | null;
    shipped_at?: string | null;
    delivered_at?: string | null;
  } = {
    fulfillment_status: input.fulfillmentStatus,
    tracking_code:
      input.fulfillmentStatus === "shipped" || input.fulfillmentStatus === "delivered"
        ? input.trackingCode
        : null,
    shipment_note: input.shipmentNote,
  };

  if (input.fulfillmentStatus === "shipped") {
    updateData.shipped_at = now;
  }

  if (input.fulfillmentStatus === "delivered") {
    updateData.delivered_at = now;
  }

  const { error } = await client
    .from("order_items")
    .update(updateData)
    .eq("order_id", input.orderId)
    .eq("seller_id", sellerProfileId);

  if (error) {
    throw new SellerOrderError("Unable to save that fulfillment update.");
  }

  return getSellerOrderById(sellerProfileId, input.orderId);
}
