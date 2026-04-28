export type ProductStatus = "draft" | "active" | "archived" | "suspended";
export type SellerStatus = "pending" | "approved" | "rejected" | "suspended";

export type ProductCategorySummary = {
  name: string;
  slug: string;
};

export type ProductSellerSummary = {
  name: string;
  slug?: string | null;
};

export type ProductImage = {
  url: string;
  alt: string;
};

export type ProductSummary = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  priceAmount: number;
  currencyCode: string;
  thumbnailUrl?: string | null;
  category?: ProductCategorySummary | null;
  seller?: ProductSellerSummary | null;
  publishedAt?: string | null;
};

export type ProductDetail = ProductSummary & {
  description: string;
  images: ProductImage[];
  availabilityLabel: string;
};

export type ProductSlugsResult = {
  slugs: string[];
  source: "supabase" | "demo";
};

export type ProductListResult = {
  products: ProductSummary[];
  source: "supabase" | "demo";
};

export type ProductSearchParams = {
  q?: string;
  category?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "relevance";
  page?: number;
  pageSize?: number;
};

export type ProductSearchResult = {
  products: ProductSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
  source: "supabase" | "demo";
};

export type ProductDetailResult = {
  product: ProductDetail | null;
  source: "supabase" | "demo";
};

export type RelatedProductsResult = {
  products: ProductSummary[];
  source: "supabase" | "demo";
};

type CatalogCategoryRecord = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

type CatalogSellerRecord = {
  id: string;
  storeName: string;
  slug?: string | null;
  status: SellerStatus;
};

export type CatalogProductRecord = {
  id: string;
  sellerId: string;
  categoryId?: string | null;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  priceAmount: number;
  currencyCode: string;
  status: ProductStatus;
  thumbnailUrl?: string | null;
  images: ProductImage[];
  publishedAt?: string | null;
};

export type CatalogSeed = {
  categories: CatalogCategoryRecord[];
  sellers: CatalogSellerRecord[];
  products: CatalogProductRecord[];
};
