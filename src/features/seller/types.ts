import type { Json } from "@/types/database";
import type { CategoryOption } from "@/features/shared/types";
import type {
  FulfillmentStatus,
  OrderStatus,
  PaymentStatus,
} from "@/features/orders/types";
import type { OrderOperationalStage } from "@/features/orders/lib/order-progress";

export type SellerProductStatus = "draft" | "active" | "archived" | "suspended";

export type SellerProductImage = {
  url: string;
  alt: string;
  sortOrder: number;
};

export type SellerProduct = {
  id: string;
  sellerId: string;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  title: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  priceAmount: number;
  currencyCode: string;
  stockQuantity: number | null;
  isUnlimitedStock: boolean;
  status: SellerProductStatus;
  thumbnailUrl: string | null;
  galleryImages: SellerProductImage[];
  metadata: Json;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SellerProductFormData = {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  priceAmount: number;
  currencyCode: string;
  stockQuantity: number | null;
  isUnlimitedStock: boolean;
  status: "draft" | "active";
  categoryId: string | null;
  thumbnailUrl: string | null;
  galleryImageUrls: string[];
};

export type SellerStoreProfileFormData = {
  storeName: string;
  slug: string;
  bio: string;
  logoUrl: string | null;
};

export type SellerApplicationFormData = SellerStoreProfileFormData & {
  supportEmail: string;
  countryCode: string;
  businessEmail: string | null;
  phone: string | null;
  agreementAccepted: boolean;
};

export type SellerOrderItem = {
  id: string;
  productId: string | null;
  productTitle: string;
  productSlug: string | null;
  quantity: number;
  unitPriceAmount: number;
  lineSubtotalAmount: number;
  discountAmount: number;
  lineTotalAmount: number;
  currencyCode: string;
  fulfillmentStatus: FulfillmentStatus;
  trackingCode: string | null;
  shipmentNote: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type SellerOrderSummary = {
  id: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  operationalStage: OrderOperationalStage;
  itemCount: number;
  totalQuantity: number;
  grossSalesAmount: number;
  currencyCode: string;
  placedAt: string | null;
  createdAt: string;
  items: SellerOrderItem[];
};

export type SellerOrderDetail = SellerOrderSummary & {
  customerName: string | null;
  customerEmail: string | null;
};

export type SellerFulfillmentUpdateInput = {
  orderId: string;
  fulfillmentStatus: Extract<FulfillmentStatus, "processing" | "shipped" | "delivered" | "cancelled">;
  trackingCode: string | null;
  shipmentNote: string | null;
};

export type SellerDashboardSummary = {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  archivedProducts: number;
  totalOrderItems: number;
  grossSalesAmount: number;
  currencyCode: string;
};

export type SellerProductFormCategory = CategoryOption;
