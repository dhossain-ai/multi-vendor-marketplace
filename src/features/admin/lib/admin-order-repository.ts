import type { Json } from "@/types/database";
import { getAdminDataClient } from "@/features/admin/lib/admin-client";
import { deriveOperationalStage } from "@/features/orders/lib/order-progress";
import type {
  AdminOrderDetail,
  AdminOrderItem,
  AdminOrderStatus,
  AdminOrderSummary,
  AdminPaymentAttempt,
  AdminPaymentStatus,
} from "@/features/admin/types";

type CustomerRow = {
  email?: string | null;
  full_name?: string | null;
};

type OrderSummaryItemRow = {
  quantity?: number | null;
  seller_id?: string | null;
  fulfillment_status?: AdminOrderItem["fulfillmentStatus"] | null;
};

type OrderSummaryRow = {
  id?: string | null;
  order_number?: string | null;
  customer_id?: string | null;
  order_status?: AdminOrderStatus | null;
  payment_status?: AdminPaymentStatus | null;
  currency_code?: string | null;
  total_amount?: number | string | null;
  placed_at?: string | null;
  created_at?: string | null;
  profiles?: CustomerRow | CustomerRow[] | null;
  order_items?: OrderSummaryItemRow[] | null;
};

type OrderDetailRow = {
  id?: string | null;
  order_number?: string | null;
  customer_id?: string | null;
  order_status?: AdminOrderStatus | null;
  payment_status?: AdminPaymentStatus | null;
  currency_code?: string | null;
  subtotal_amount?: number | string | null;
  discount_amount?: number | string | null;
  tax_amount?: number | string | null;
  total_amount?: number | string | null;
  coupon_id?: string | null;
  shipping_address_snapshot?: Json | null;
  billing_address_snapshot?: Json | null;
  placed_at?: string | null;
  created_at?: string | null;
  profiles?: CustomerRow | CustomerRow[] | null;
};

type SellerRow = {
  store_name?: string | null;
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
  fulfillment_status?: AdminOrderItem["fulfillmentStatus"] | null;
  tracking_code?: string | null;
  shipment_note?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  product_metadata_snapshot?: Json | null;
  created_at?: string | null;
  seller_profiles?: SellerRow | SellerRow[] | null;
};

type PaymentRow = {
  id?: string | null;
  provider?: string | null;
  provider_session_id?: string | null;
  provider_payment_id?: string | null;
  status?: AdminPaymentStatus | null;
  amount?: number | string | null;
  currency_code?: string | null;
  paid_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const normalizeJoinedRecord = <T>(value: T | T[] | null | undefined) => {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
};

const mapOrderSummary = (row: OrderSummaryRow): AdminOrderSummary | null => {
  if (
    !row.id ||
    !row.order_number ||
    !row.customer_id ||
    !row.order_status ||
    !row.payment_status ||
    !row.currency_code ||
    row.total_amount == null ||
    !row.created_at
  ) {
    return null;
  }

  const customer = normalizeJoinedRecord(row.profiles);
  const itemRows = row.order_items ?? [];
  const sellerIds = new Set(
    itemRows.flatMap((item) => (item.seller_id ? [item.seller_id] : [])),
  );

  return {
    id: row.id,
    orderNumber: row.order_number,
    customerId: row.customer_id,
    customerEmail: customer?.email ?? null,
    customerName: customer?.full_name ?? null,
    orderStatus: row.order_status,
    paymentStatus: row.payment_status,
    operationalStage: deriveOperationalStage({
      orderStatus: row.order_status,
      paymentStatus: row.payment_status,
      fulfillmentStatuses: itemRows.flatMap((item) =>
        item.fulfillment_status ? [item.fulfillment_status] : [],
      ),
    }),
    itemCount: itemRows.reduce((count, item) => count + (item.quantity ?? 0), 0),
    sellerCount: sellerIds.size,
    totalAmount: Number(row.total_amount),
    currencyCode: row.currency_code,
    placedAt: row.placed_at ?? null,
    createdAt: row.created_at,
  };
};

const mapOrderItem = (row: OrderItemRow): AdminOrderItem | null => {
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
    !row.fulfillment_status ||
    !row.created_at
  ) {
    return null;
  }

  const seller = normalizeJoinedRecord(row.seller_profiles);
  const metadata =
    row.product_metadata_snapshot &&
    typeof row.product_metadata_snapshot === "object" &&
    !Array.isArray(row.product_metadata_snapshot)
      ? (row.product_metadata_snapshot as Record<string, unknown>)
      : {};

  return {
    id: row.id,
    productId: row.product_id ?? null,
    sellerId: row.seller_id,
    sellerName:
      seller?.store_name ??
      (typeof metadata.sellerName === "string" ? metadata.sellerName : null),
    productTitle: row.product_title_snapshot,
    productSlug: row.product_slug_snapshot ?? null,
    unitPriceAmount: Number(row.unit_price_amount),
    quantity: row.quantity,
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

const mapPayment = (row: PaymentRow): AdminPaymentAttempt | null => {
  if (
    !row.id ||
    !row.provider ||
    !row.status ||
    row.amount == null ||
    !row.currency_code ||
    !row.created_at ||
    !row.updated_at
  ) {
    return null;
  }

  return {
    id: row.id,
    provider: row.provider,
    providerSessionId: row.provider_session_id ?? null,
    providerPaymentId: row.provider_payment_id ?? null,
    status: row.status,
    amount: Number(row.amount),
    currencyCode: row.currency_code,
    paidAt: row.paid_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export class AdminOrderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminOrderError";
  }
}

export async function getAdminOrders(filters?: {
  orderStatus?: AdminOrderStatus | null;
  paymentStatus?: AdminPaymentStatus | null;
}) {
  const client = await getAdminDataClient();
  let query = client
    .from("orders")
    .select(
      `
        id,
        order_number,
        customer_id,
        order_status,
        payment_status,
        currency_code,
        total_amount,
        placed_at,
        created_at,
        profiles!orders_customer_id_fkey (
          email,
          full_name
        ),
        order_items (
          quantity,
          seller_id,
          fulfillment_status
        )
      `,
    )
    .order("created_at", { ascending: false });

  if (filters?.orderStatus) {
    query = query.eq("order_status", filters.orderStatus);
  }

  if (filters?.paymentStatus) {
    query = query.eq("payment_status", filters.paymentStatus);
  }

  const { data, error } = await query;

  if (error) {
    throw new AdminOrderError("Unable to load platform orders.");
  }

  return ((data as OrderSummaryRow[]) ?? [])
    .map(mapOrderSummary)
    .filter((order): order is AdminOrderSummary => Boolean(order));
}

export async function getAdminOrderById(orderId: string): Promise<AdminOrderDetail | null> {
  const client = await getAdminDataClient();
  const { data: orderData, error: orderError } = await client
    .from("orders")
    .select(
      `
        id,
        order_number,
        customer_id,
        order_status,
        payment_status,
        currency_code,
        subtotal_amount,
        discount_amount,
        tax_amount,
        total_amount,
        coupon_id,
        shipping_address_snapshot,
        billing_address_snapshot,
        placed_at,
        created_at,
        profiles!orders_customer_id_fkey (
          email,
          full_name
        )
      `,
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) {
    throw new AdminOrderError("Unable to load order detail.");
  }

  const order = orderData as OrderDetailRow | null;

  if (
    !order?.id ||
    !order.order_number ||
    !order.customer_id ||
    !order.order_status ||
    !order.payment_status ||
    !order.currency_code ||
    order.subtotal_amount == null ||
    order.discount_amount == null ||
    order.tax_amount == null ||
    order.total_amount == null ||
    !order.created_at
  ) {
    return null;
  }

  const { data: itemData, error: itemError } = await client
    .from("order_items")
    .select(
      `
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
        fulfillment_status,
        tracking_code,
        shipment_note,
        shipped_at,
        delivered_at,
        product_metadata_snapshot,
        created_at,
        seller_profiles!order_items_seller_id_fkey (
          store_name
        )
      `,
    )
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (itemError) {
    throw new AdminOrderError("Unable to load order items.");
  }

  const { data: paymentData, error: paymentError } = await client
    .from("payments")
    .select(
      `
        id,
        provider,
        provider_session_id,
        provider_payment_id,
        status,
        amount,
        currency_code,
        paid_at,
        created_at,
        updated_at
      `,
    )
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  if (paymentError) {
    throw new AdminOrderError("Unable to load payment attempts.");
  }

  const customer = normalizeJoinedRecord(order.profiles);

  return {
    id: order.id,
    orderNumber: order.order_number,
    customerId: order.customer_id,
    customerEmail: customer?.email ?? null,
    customerName: customer?.full_name ?? null,
    orderStatus: order.order_status,
    paymentStatus: order.payment_status,
    operationalStage: deriveOperationalStage({
      orderStatus: order.order_status,
      paymentStatus: order.payment_status,
      fulfillmentStatuses: ((itemData as OrderItemRow[]) ?? [])
        .flatMap((item) =>
          item.fulfillment_status ? [item.fulfillment_status] : [],
        ),
    }),
    subtotalAmount: Number(order.subtotal_amount),
    discountAmount: Number(order.discount_amount),
    taxAmount: Number(order.tax_amount),
    totalAmount: Number(order.total_amount),
    currencyCode: order.currency_code,
    couponId: order.coupon_id ?? null,
    placedAt: order.placed_at ?? null,
    createdAt: order.created_at,
    shippingAddressSnapshot: order.shipping_address_snapshot ?? null,
    billingAddressSnapshot: order.billing_address_snapshot ?? null,
    items: ((itemData as OrderItemRow[]) ?? [])
      .map(mapOrderItem)
      .filter((item): item is AdminOrderItem => Boolean(item)),
    payments: ((paymentData as PaymentRow[]) ?? [])
      .map(mapPayment)
      .filter((payment): payment is AdminPaymentAttempt => Boolean(payment)),
  };
}
