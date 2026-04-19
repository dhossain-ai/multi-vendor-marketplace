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

export type CartSnapshot = {
  cartId: string | null;
  items: CartItem[];
  itemCount: number;
  subtotalAmount: number;
  currencyCode: string;
  hasUnavailableItems: boolean;
  isEmpty: boolean;
};
