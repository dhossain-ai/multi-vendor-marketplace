import type { Json } from "@/types/database";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "completed"
  | "cancelled"
  | "refunded"
  | "partially_refunded";

export type PaymentStatus =
  | "unpaid"
  | "processing"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

export type OrderItemSnapshotMetadata = {
  thumbnailUrl?: string | null;
  sellerName?: string | null;
  sellerSlug?: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
} & Record<string, Json | undefined>;

export type CustomerOrderSummary = {
  id: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  itemCount: number;
  currencyCode: string;
  totalAmount: number;
  placedAt: string | null;
  createdAt: string;
};

export type CustomerOrderItem = {
  id: string;
  productId: string | null;
  sellerId: string;
  productTitle: string;
  productSlug: string | null;
  unitPriceAmount: number;
  quantity: number;
  lineSubtotalAmount: number;
  discountAmount: number;
  lineTotalAmount: number;
  currencyCode: string;
  metadata: OrderItemSnapshotMetadata;
  createdAt: string;
};

export type CustomerOrderDetail = CustomerOrderSummary & {
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  items: CustomerOrderItem[];
};
