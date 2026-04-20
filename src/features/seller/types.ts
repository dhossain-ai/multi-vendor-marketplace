import type { Json } from "@/types/database";

export type SellerProductStatus = "draft" | "active" | "archived" | "suspended";

export type SellerProduct = {
  id: string;
  sellerId: string;
  categoryId: string | null;
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
};

export type SellerOrderItem = {
  id: string;
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  productTitle: string;
  productSlug: string | null;
  unitPriceAmount: number;
  quantity: number;
  lineTotalAmount: number;
  currencyCode: string;
  metadata: Record<string, unknown>;
  orderPlacedAt: string | null;
  createdAt: string;
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
