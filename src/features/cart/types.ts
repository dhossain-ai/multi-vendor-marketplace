export type CartSellerSummary = {
  name: string;
  slug?: string | null;
};

export type CartCategorySummary = {
  name: string;
  slug: string;
};

export type CartItemAvailability =
  | "available"
  | "unavailable"
  | "limited_stock";

export type CartItem = {
  id: string;
  productId: string;
  sellerId: string;
  productSlug: string;
  title: string;
  thumbnailUrl: string | null;
  quantity: number;
  unitPriceAmount: number;
  currencyCode: string;
  lineTotalAmount: number;
  seller: CartSellerSummary | null;
  category: CartCategorySummary | null;
  availability: CartItemAvailability;
  availabilityLabel: string;
};

export type CartAppliedCoupon = {
  id: string;
  code: string;
  discountAmount: number;
  isValid: boolean;
  message: string;
};

export type CartSnapshot = {
  cartId: string | null;
  items: CartItem[];
  itemCount: number;
  subtotalAmount: number;
  discountAmount: number;
  totalAmount: number;
  currencyCode: string;
  appliedCoupon: CartAppliedCoupon | null;
  hasUnavailableItems: boolean;
  isEmpty: boolean;
};
