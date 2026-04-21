import type { AppliedCoupon } from "@/features/checkout/lib/coupon-service";

export type CheckoutItemStatus = "ready" | "invalid";

export type CheckoutSellerSummary = {
  id: string;
  name: string;
  slug?: string | null;
};

export type CheckoutCategorySummary = {
  name: string;
  slug: string;
};

export type CheckoutItem = {
  cartItemId: string;
  productId: string;
  sellerId: string;
  productSlug: string;
  title: string;
  thumbnailUrl: string | null;
  quantity: number;
  unitPriceAmount: number;
  lineSubtotalAmount: number;
  discountAmount: number;
  lineTotalAmount: number;
  currencyCode: string;
  seller: CheckoutSellerSummary;
  category: CheckoutCategorySummary | null;
  status: CheckoutItemStatus;
  availabilityLabel: string;
  issues: string[];
  snapshotMetadata: {
    thumbnailUrl: string | null;
    sellerName: string;
    sellerSlug?: string | null;
    categoryName?: string | null;
    categorySlug?: string | null;
  };
};

export type CheckoutTotals = {
  itemCount: number;
  currencyCode: string;
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
};

export type CheckoutValidationResult = {
  status: "ready" | "invalid" | "empty";
  cartId: string | null;
  items: CheckoutItem[];
  totals: CheckoutTotals;
  appliedCoupon: AppliedCoupon | null;
  errors: string[];
  canSubmit: boolean;
};

export type PendingOrderResult = {
  id: string;
  orderNumber: string;
};
