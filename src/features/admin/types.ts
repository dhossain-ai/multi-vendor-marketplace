import type { Json } from "@/types/database";
import type { FulfillmentStatus } from "@/features/orders/types";
import type { OrderOperationalStage } from "@/features/orders/lib/order-progress";

export type AdminSellerStatus = "pending" | "approved" | "rejected" | "suspended";
export type AdminProductStatus = "draft" | "active" | "archived" | "suspended";
export type AdminCouponType = "fixed" | "percentage";
export type AdminOrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "completed"
  | "cancelled"
  | "refunded"
  | "partially_refunded";
export type AdminPaymentStatus =
  | "unpaid"
  | "processing"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

export type AdminDashboardSummary = {
  totalCustomers: number;
  totalSellers: number;
  pendingSellerApplications: number;
  activeProducts: number;
  recentOrdersCount: number;
  grossRevenueAmount: number;
  currencyCode: string;
};

export type AdminSeller = {
  id: string;
  userId: string;
  storeName: string;
  slug: string | null;
  status: AdminSellerStatus;
  ownerEmail: string | null;
  ownerName: string | null;
  bio: string | null;
  logoUrl: string | null;
  supportEmail: string | null;
  businessEmail: string | null;
  phone: string | null;
  countryCode: string | null;
  agreementAcceptedAt: string | null;
  rejectionReason: string | null;
  suspensionReason: string | null;
  resubmittedAt: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  productCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminSellerHistoryEvent = {
  id: string;
  sellerId: string;
  changedBy: string | null;
  previousStatus: AdminSellerStatus | null;
  newStatus: AdminSellerStatus;
  reason: string | null;
  createdAt: string;
};

export type AdminSellerDetail = AdminSeller & {
  emailConfirmedAt: string | null;
  history: AdminSellerHistoryEvent[];
};

export type AdminProduct = {
  id: string;
  sellerId: string;
  sellerName: string | null;
  sellerStatus: AdminSellerStatus | null;
  categoryId: string | null;
  categoryName: string | null;
  title: string;
  slug: string;
  priceAmount: number;
  currencyCode: string;
  stockQuantity: number | null;
  isUnlimitedStock: boolean;
  status: AdminProductStatus;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parentName: string | null;
  isActive: boolean;
  sortOrder: number;
  activeProductCount: number;
  totalProductCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminCategoryWriteInput = {
  name: string;
  slug: string;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
};

export type AdminCoupon = {
  id: string;
  code: string;
  type: AdminCouponType;
  valueAmount: number;
  minimumOrderAmount: number | null;
  usageLimitTotal: number | null;
  usageLimitPerUser: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  sellerId: string | null;
  sellerName: string | null;
  createdBy: string | null;
  createdByEmail: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminCouponWriteInput = {
  code: string;
  type: AdminCouponType;
  valueAmount: number;
  minimumOrderAmount: number | null;
  usageLimitTotal: number | null;
  usageLimitPerUser: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  sellerId: string | null;
};

export type AdminOrderSummary = {
  id: string;
  orderNumber: string;
  customerId: string;
  customerEmail: string | null;
  customerName: string | null;
  orderStatus: AdminOrderStatus;
  paymentStatus: AdminPaymentStatus;
  operationalStage: OrderOperationalStage;
  itemCount: number;
  sellerCount: number;
  totalAmount: number;
  currencyCode: string;
  placedAt: string | null;
  createdAt: string;
};

export type AdminOrderItem = {
  id: string;
  productId: string | null;
  sellerId: string;
  sellerName: string | null;
  productTitle: string;
  productSlug: string | null;
  unitPriceAmount: number;
  quantity: number;
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

export type AdminPaymentAttempt = {
  id: string;
  provider: string;
  providerSessionId: string | null;
  providerPaymentId: string | null;
  status: AdminPaymentStatus;
  amount: number;
  currencyCode: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminOrderDetail = {
  id: string;
  orderNumber: string;
  customerId: string;
  customerEmail: string | null;
  customerName: string | null;
  orderStatus: AdminOrderStatus;
  paymentStatus: AdminPaymentStatus;
  operationalStage: OrderOperationalStage;
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  currencyCode: string;
  couponId: string | null;
  placedAt: string | null;
  createdAt: string;
  shippingAddressSnapshot: Json | null;
  billingAddressSnapshot: Json | null;
  items: AdminOrderItem[];
  payments: AdminPaymentAttempt[];
};
