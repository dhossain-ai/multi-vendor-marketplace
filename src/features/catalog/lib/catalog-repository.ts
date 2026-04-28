import { cache } from "react";
import { hasSupabasePublicEnv } from "@/lib/config/env";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { catalogDemoData } from "@/features/catalog/lib/catalog-demo-data";
import type {
  CatalogProductRecord,
  ProductDetail,
  ProductDetailResult,
  ProductImage,
  ProductListResult,
  ProductSearchParams,
  ProductSearchResult,
  ProductSlugsResult,
  ProductSummary,
  RelatedProductsResult,
  SellerStatus,
} from "@/features/catalog/types";

type CatalogCategoryRow = {
  id?: string | null;
  name?: string | null;
  slug?: string | null;
  is_active?: boolean | null;
};

type CatalogSellerRow = {
  id?: string | null;
  store_name?: string | null;
  slug?: string | null;
  status?: SellerStatus | null;
};

type CatalogImageRow = {
  image_url?: string | null;
  alt_text?: string | null;
  sort_order?: number | null;
};

type CatalogProductRow = {
  id?: string | null;
  seller_id?: string | null;
  category_id?: string | null;
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  short_description?: string | null;
  price_amount?: number | string | null;
  currency_code?: string | null;
  status?: string | null;
  thumbnail_url?: string | null;
  published_at?: string | null;
  categories?: CatalogCategoryRow | CatalogCategoryRow[] | null;
  seller_profiles?: CatalogSellerRow | CatalogSellerRow[] | null;
  product_images?: CatalogImageRow[] | null;
};

const PUBLIC_PAGE_SIZE = 6;

const comparePublishedAtDesc = (
  left: { publishedAt?: string | null },
  right: { publishedAt?: string | null },
) => {
  const leftTime = left.publishedAt ? Date.parse(left.publishedAt) : 0;
  const rightTime = right.publishedAt ? Date.parse(right.publishedAt) : 0;

  return rightTime - leftTime;
};

const normalizeJoinedRecord = <T>(value: T | T[] | null | undefined) => {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
};

const isPublicVisibilitySatisfied = (input: {
  productStatus?: string | null;
  sellerStatus?: string | null;
  categoryIsActive?: boolean | null;
}) =>
  input.productStatus === "active" &&
  input.sellerStatus === "approved" &&
  input.categoryIsActive !== false;

const mapImages = (
  images: CatalogImageRow[] | null | undefined,
): ProductImage[] =>
  (images ?? [])
    .slice()
    .sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0))
    .flatMap((image) => {
      if (!image.image_url) {
        return [];
      }

      return [
        {
          url: image.image_url,
          alt: image.alt_text ?? "Product image",
        },
      ];
    });

const mapProductRowToSummary = (
  row: CatalogProductRow,
): ProductSummary | null => {
  const category = normalizeJoinedRecord(row.categories);
  const seller = normalizeJoinedRecord(row.seller_profiles);

  if (
    !row.id ||
    !row.title ||
    !row.slug ||
    row.price_amount == null ||
    !isPublicVisibilitySatisfied({
      productStatus: row.status,
      sellerStatus: seller?.status,
      categoryIsActive: category?.is_active,
    })
  ) {
    return null;
  }

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription:
      row.short_description ??
      row.description ??
      "More product details coming soon.",
    priceAmount: Number(row.price_amount),
    currencyCode: row.currency_code ?? "USD",
    thumbnailUrl: row.thumbnail_url,
    category:
      category?.name && category.slug
        ? {
            name: category.name,
            slug: category.slug,
          }
        : null,
    seller: seller?.store_name
      ? {
          name: seller.store_name,
          slug: seller.slug,
        }
      : null,
    publishedAt: row.published_at,
  };
};

const mapProductRowToDetail = (
  row: CatalogProductRow,
): ProductDetail | null => {
  const summary = mapProductRowToSummary(row);

  if (!summary) {
    return null;
  }

  const images = mapImages(row.product_images);

  return {
    ...summary,
    description:
      row.description ??
      row.short_description ??
      "A richer product description will be available once seller tooling is implemented.",
    images:
      images.length > 0
        ? images
        : summary.thumbnailUrl
          ? [{ url: summary.thumbnailUrl, alt: `${summary.title} thumbnail` }]
          : [],
    availabilityLabel: "Available now",
  };
};

const getCategoryById = (categoryId?: string | null) =>
  catalogDemoData.categories.find((category) => category.id === categoryId) ??
  null;

const getSellerById = (sellerId: string) =>
  catalogDemoData.sellers.find((seller) => seller.id === sellerId) ?? null;

const mapDemoProductToSummary = (
  product: CatalogProductRecord,
): ProductSummary | null => {
  const category = getCategoryById(product.categoryId);
  const seller = getSellerById(product.sellerId);

  if (
    !seller ||
    !isPublicVisibilitySatisfied({
      productStatus: product.status,
      sellerStatus: seller.status,
      categoryIsActive: category?.isActive,
    })
  ) {
    return null;
  }

  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    shortDescription:
      product.shortDescription ?? "A short product summary will be added soon.",
    priceAmount: product.priceAmount,
    currencyCode: product.currencyCode,
    thumbnailUrl: product.thumbnailUrl,
    category: category ? { name: category.name, slug: category.slug } : null,
    seller: { name: seller.storeName, slug: seller.slug },
    publishedAt: product.publishedAt,
  };
};

const mapDemoProductToDetail = (
  product: CatalogProductRecord,
): ProductDetail | null => {
  const summary = mapDemoProductToSummary(product);

  if (!summary) {
    return null;
  }

  return {
    ...summary,
    description: product.description,
    images:
      product.images.length > 0
        ? product.images
        : summary.thumbnailUrl
          ? [{ url: summary.thumbnailUrl, alt: `${summary.title} thumbnail` }]
          : [],
    availabilityLabel: "Available now",
  };
};

const listDemoProducts = (limit = PUBLIC_PAGE_SIZE): ProductListResult => ({
  products: catalogDemoData.products
    .map(mapDemoProductToSummary)
    .filter((product): product is ProductSummary => Boolean(product))
    .sort(comparePublishedAtDesc)
    .slice(0, limit),
  source: "demo",
});

const getDemoProductBySlug = (slug: string): ProductDetailResult => {
  const product = catalogDemoData.products.find((item) => item.slug === slug);

  return {
    product: product ? mapDemoProductToDetail(product) : null,
    source: "demo",
  };
};

const listDemoRelatedProducts = (
  productId: string,
  categorySlug?: string | null,
  limit = 3,
): RelatedProductsResult => ({
  products: catalogDemoData.products
    .filter((product) => product.id !== productId)
    .map(mapDemoProductToSummary)
    .filter((product): product is ProductSummary => Boolean(product))
    .filter(
      (product) => !categorySlug || product.category?.slug === categorySlug,
    )
    .sort(comparePublishedAtDesc)
    .slice(0, limit),
  source: "demo",
});

const listDemoProductSlugs = (): ProductSlugsResult => ({
  slugs: listDemoProducts(50).products.map((product) => product.slug),
  source: "demo",
});

const searchDemoProducts = (params: ProductSearchParams): ProductSearchResult => {
  let filtered = catalogDemoData.products
    .map(mapDemoProductToSummary)
    .filter((product): product is ProductSummary => Boolean(product));

  if (params.q) {
    const query = params.q.toLowerCase();
    filtered = filtered.filter(
      (product) =>
        product.title.toLowerCase().includes(query) ||
        product.shortDescription.toLowerCase().includes(query),
    );
  }

  if (params.category) {
    filtered = filtered.filter(
      (product) => product.category?.slug === params.category,
    );
  }

  const sort = params.sort ?? (params.q ? "relevance" : "newest");

  filtered.sort((left, right) => {
    switch (sort) {
      case "price_asc":
        return left.priceAmount - right.priceAmount;
      case "price_desc":
        return right.priceAmount - left.priceAmount;
      case "newest":
      case "relevance":
      default:
        return comparePublishedAtDesc(left, right);
    }
  });

  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 20));
  const totalCount = filtered.length;
  const start = (page - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  return {
    products: paginated,
    totalCount,
    page,
    pageSize,
    source: "demo",
  };
};

const getFallbackReason = (error: unknown) => {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Unknown Supabase catalog error.";
};

const withSupabaseFallback = async <T>(
  query: () => Promise<T>,
  fallback: () => T,
) => {
  if (!hasSupabasePublicEnv()) {
    return fallback();
  }

  try {
    return await query();
  } catch (error) {
    console.warn(
      "Catalog repository used demo data because the Supabase catalog query failed:",
      getFallbackReason(error),
    );
    return fallback();
  }
};

const listSupabaseProducts = async (
  limit = PUBLIC_PAGE_SIZE,
): Promise<ProductListResult> => {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `
        id,
        seller_id,
        category_id,
        title,
        slug,
        description,
        short_description,
        price_amount,
        currency_code,
        status,
        thumbnail_url,
        published_at,
        categories (
          id,
          name,
          slug,
          is_active
        ),
        seller_profiles!products_seller_id_fkey (
          id,
          store_name,
          slug,
          status
        )
      `,
    )
    .eq("status", "active")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return {
    products: (data as CatalogProductRow[])
      .map(mapProductRowToSummary)
      .filter((product): product is ProductSummary => Boolean(product)),
    source: "supabase",
  };
};

const getSupabaseProductBySlug = async (
  slug: string,
): Promise<ProductDetailResult> => {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `
        id,
        seller_id,
        category_id,
        title,
        slug,
        description,
        short_description,
        price_amount,
        currency_code,
        status,
        thumbnail_url,
        published_at,
        categories (
          id,
          name,
          slug,
          is_active
        ),
        seller_profiles!products_seller_id_fkey (
          id,
          store_name,
          slug,
          status
        ),
        product_images (
          image_url,
          alt_text,
          sort_order
        )
      `,
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return {
    product: data ? mapProductRowToDetail(data as CatalogProductRow) : null,
    source: "supabase",
  };
};

const listSupabaseRelatedProducts = async (
  productId: string,
  categorySlug?: string | null,
  limit = 3,
): Promise<RelatedProductsResult> => {
  const supabase = createSupabasePublicClient();
  let query = supabase
    .from("products")
    .select(
      `
        id,
        seller_id,
        category_id,
        title,
        slug,
        description,
        short_description,
        price_amount,
        currency_code,
        status,
        thumbnail_url,
        published_at,
        categories (
          id,
          name,
          slug,
          is_active
        ),
        seller_profiles!products_seller_id_fkey (
          id,
          store_name,
          slug,
          status
        )
      `,
    )
    .eq("status", "active")
    .neq("id", productId)
    .order("published_at", { ascending: false })
    .limit(limit + 2);

  if (categorySlug) {
    query = query.eq("categories.slug", categorySlug);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return {
    products: (data as CatalogProductRow[])
      .map(mapProductRowToSummary)
      .filter((product): product is ProductSummary => Boolean(product))
      .slice(0, limit),
    source: "supabase",
  };
};

const listSupabaseProductSlugs = async (): Promise<ProductSlugsResult> => {
  const result = await listSupabaseProducts(24);

  return {
    slugs: result.products.map((product) => product.slug),
    source: result.source,
  };
};

const searchSupabaseProducts = async (
  params: ProductSearchParams,
): Promise<ProductSearchResult> => {
  const supabase = createSupabasePublicClient();
  let query = supabase
    .from("products")
    .select(
      `
        id,
        seller_id,
        category_id,
        title,
        slug,
        description,
        short_description,
        price_amount,
        currency_code,
        status,
        thumbnail_url,
        published_at,
        categories!inner (
          id,
          name,
          slug,
          is_active
        ),
        seller_profiles!inner!products_seller_id_fkey (
          id,
          store_name,
          slug,
          status
        )
      `,
      { count: "exact" }
    )
    .eq("status", "active")
    .eq("seller_profiles.status", "approved")
    .eq("categories.is_active", true);

  if (params.q) {
    query = query.ilike("title", `%${params.q}%`); // Note: In a real app we'd use full-text search
  }

  if (params.category) {
    query = query.eq("categories.slug", params.category);
  }

  const sort = params.sort ?? (params.q ? "relevance" : "newest");

  switch (sort) {
    case "price_asc":
      query = query.order("price_amount", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price_amount", { ascending: false });
      break;
    case "newest":
    case "relevance":
    default:
      query = query.order("published_at", { ascending: false });
      break;
  }

  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 20));
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  query = query.range(start, end);

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  return {
    products: (data as CatalogProductRow[])
      .map(mapProductRowToSummary)
      .filter((product): product is ProductSummary => Boolean(product)),
    totalCount: count ?? 0,
    page,
    pageSize,
    source: "supabase",
  };
};

export const listPublicProducts = cache(async (limit = PUBLIC_PAGE_SIZE) =>
  withSupabaseFallback(
    () => listSupabaseProducts(limit),
    () => listDemoProducts(limit),
  ),
);

export const getPublicProductBySlug = cache(async (slug: string) =>
  withSupabaseFallback(
    () => getSupabaseProductBySlug(slug),
    () => getDemoProductBySlug(slug),
  ),
);

export const listRelatedProducts = cache(
  async (productId: string, categorySlug?: string | null) =>
    withSupabaseFallback(
      () => listSupabaseRelatedProducts(productId, categorySlug),
      () => listDemoRelatedProducts(productId, categorySlug),
    ),
);

export const listPublicProductSlugs = cache(async () =>
  withSupabaseFallback(listSupabaseProductSlugs, listDemoProductSlugs),
);

export const searchPublicProducts = cache(async (params: ProductSearchParams) =>
  withSupabaseFallback(
    () => searchSupabaseProducts(params),
    () => searchDemoProducts(params),
  ),
);
