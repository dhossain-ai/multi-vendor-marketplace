import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseServiceRoleEnv } from "@/lib/config/env";
import type { Database, Json } from "@/types/database";
import type { SellerProduct, SellerProductFormData } from "@/features/seller/types";

type CategoryRow = {
  name?: string | null;
  slug?: string | null;
};

type ProductImageRow = {
  image_url?: string | null;
  alt_text?: string | null;
  sort_order?: number | null;
};

type ProductRow = {
  id?: string | null;
  seller_id?: string | null;
  category_id?: string | null;
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  short_description?: string | null;
  price_amount?: number | string | null;
  currency_code?: string | null;
  stock_quantity?: number | null;
  is_unlimited_stock?: boolean | null;
  low_stock_threshold?: number | null;
  status?: string | null;
  thumbnail_url?: string | null;
  metadata?: Json | null;
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  categories?: CategoryRow | CategoryRow[] | null;
  product_images?: ProductImageRow[] | null;
};

const getSellerClient = async () =>
  hasSupabaseServiceRoleEnv()
    ? createSupabaseAdminClient()
    : createSupabaseServerClient();

export class SellerProductError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SellerProductError";
  }
}

const normalizeJoinedRecord = <T>(value: T | T[] | null | undefined) => {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
};

const mapProductRow = (row: ProductRow): SellerProduct | null => {
  const category = normalizeJoinedRecord(row.categories);

  if (
    !row.id ||
    !row.seller_id ||
    !row.title ||
    !row.slug ||
    row.price_amount == null ||
    !row.currency_code ||
    !row.status ||
    !row.created_at ||
    !row.updated_at
  ) {
    return null;
  }

  return {
    id: row.id,
    sellerId: row.seller_id,
    categoryId: row.category_id ?? null,
    categoryName: category?.name ?? null,
    categorySlug: category?.slug ?? null,
    title: row.title,
    slug: row.slug,
    description: row.description ?? null,
    shortDescription: row.short_description ?? null,
    priceAmount: Number(row.price_amount),
    currencyCode: row.currency_code,
    stockQuantity: row.stock_quantity ?? null,
    isUnlimitedStock: row.is_unlimited_stock ?? false,
    lowStockThreshold: row.low_stock_threshold ?? 5,
    status: row.status as SellerProduct["status"],
    thumbnailUrl: row.thumbnail_url ?? null,
    galleryImages: (row.product_images ?? [])
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
            sortOrder: image.sort_order ?? 0,
          },
        ];
      }),
    metadata: row.metadata ?? {},
    publishedAt: row.published_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

async function syncProductImages(
  client: Awaited<ReturnType<typeof getSellerClient>>,
  productId: string,
  title: string,
  imageUrls: string[],
) {
  const { error: deleteError } = await client
    .from("product_images")
    .delete()
    .eq("product_id", productId);

  if (deleteError) {
    throw new SellerProductError("Unable to update product images.");
  }

  if (imageUrls.length === 0) {
    return;
  }

  const { error: insertError } = await client.from("product_images").insert(
    imageUrls.map((url, index) => ({
      product_id: productId,
      image_url: url,
      alt_text: `${title} image ${index + 1}`,
      sort_order: index,
    })),
  );

  if (insertError) {
    throw new SellerProductError("Unable to save product images.");
  }
}

/**
 * List all products owned by the seller (any status).
 */
export async function getSellerProducts(
  sellerProfileId: string,
): Promise<SellerProduct[]> {
  const client = await getSellerClient();

  const { data, error } = await client
    .from("products")
    .select(
      `
        *,
        categories (
          name,
          slug
        )
      `,
    )
    .eq("seller_id", sellerProfileId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new SellerProductError("Unable to load seller products.");
  }

  return (data as ProductRow[])
    .map(mapProductRow)
    .filter((p): p is SellerProduct => Boolean(p));
}

/**
 * Get a single product with ownership verification.
 */
export async function getSellerProductById(
  sellerProfileId: string,
  productId: string,
): Promise<SellerProduct | null> {
  const client = await getSellerClient();

  const { data, error } = await client
    .from("products")
    .select(
      `
        *,
        categories (
          name,
          slug
        ),
        product_images (
          image_url,
          alt_text,
          sort_order
        )
      `,
    )
    .eq("id", productId)
    .eq("seller_id", sellerProfileId)
    .maybeSingle();

  if (error) {
    throw new SellerProductError("Unable to load product.");
  }

  return data ? mapProductRow(data as ProductRow) : null;
}

/**
 * Create a new product owned by the seller.
 * Server assigns seller_id — never from client input.
 */
export async function createSellerProduct(
  sellerProfileId: string,
  formData: SellerProductFormData,
): Promise<SellerProduct> {
  const client = await getSellerClient();
  type InsertedProductIdRow = { id: string };

  const { data, error } = await client
    .from("products")
    .insert({
      seller_id: sellerProfileId,
      title: formData.title,
      slug: formData.slug,
      description: formData.description || null,
      short_description: formData.shortDescription || null,
      price_amount: formData.priceAmount,
      currency_code: formData.currencyCode,
      stock_quantity: formData.stockQuantity,
      is_unlimited_stock: formData.isUnlimitedStock,
      low_stock_threshold: formData.lowStockThreshold,
      status: formData.status,
      category_id: formData.categoryId,
      thumbnail_url: formData.thumbnailUrl,
      published_at: formData.status === "active" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new SellerProductError("A product with this slug already exists.");
    }
    throw new SellerProductError("Unable to create product.");
  }

  const inserted = data as InsertedProductIdRow | null;

  if (!inserted?.id) {
    throw new SellerProductError("Created product id could not be read.");
  }

  await syncProductImages(client, inserted.id, formData.title, formData.galleryImageUrls);

  const created = await getSellerProductById(sellerProfileId, inserted.id);
  if (!created) {
    throw new SellerProductError("Created product could not be read.");
  }

  return created;
}

/**
 * Update a product with ownership guard.
 * Only updates fields the seller is allowed to change.
 */
export async function updateSellerProduct(
  sellerProfileId: string,
  productId: string,
  formData: SellerProductFormData,
): Promise<SellerProduct> {
  const client = await getSellerClient();
  const currentProduct = await getSellerProductById(sellerProfileId, productId);

  if (!currentProduct) {
    throw new SellerProductError("Product not found.");
  }

  if (currentProduct.status === "suspended") {
    throw new SellerProductError(
      "Suspended products can only be reactivated by an admin.",
    );
  }

  type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

  const updateData: ProductUpdate = {
    title: formData.title,
    slug: formData.slug,
    description: formData.description || null,
    short_description: formData.shortDescription || null,
    price_amount: formData.priceAmount,
    currency_code: formData.currencyCode,
    stock_quantity: formData.stockQuantity,
    is_unlimited_stock: formData.isUnlimitedStock,
    low_stock_threshold: formData.lowStockThreshold,
    status: formData.status,
    category_id: formData.categoryId,
    thumbnail_url: formData.thumbnailUrl,
    published_at:
      formData.status === "active"
        ? currentProduct.publishedAt ?? new Date().toISOString()
        : null,
  };

  const { error } = await client
    .from("products")
    .update(updateData)
    .eq("id", productId)
    .eq("seller_id", sellerProfileId);

  if (error) {
    if (error.code === "23505") {
      throw new SellerProductError("A product with this slug already exists.");
    }
    throw new SellerProductError("Unable to update product.");
  }

  await syncProductImages(client, productId, formData.title, formData.galleryImageUrls);

  const updated = await getSellerProductById(sellerProfileId, productId);
  if (!updated) {
    throw new SellerProductError("Updated product could not be read.");
  }

  return updated;
}

/**
 * Archive a product (soft-delete). Ownership-guarded.
 */
export async function archiveSellerProduct(
  sellerProfileId: string,
  productId: string,
): Promise<void> {
  const client = await getSellerClient();
  const currentProduct = await getSellerProductById(sellerProfileId, productId);

  if (!currentProduct) {
    throw new SellerProductError("Product not found.");
  }

  if (currentProduct.status === "suspended") {
    throw new SellerProductError(
      "Suspended products cannot be archived from the seller dashboard.",
    );
  }

  const { error } = await client
    .from("products")
    .update({
      status: "archived",
      published_at: null,
    } as Database["public"]["Tables"]["products"]["Update"])
    .eq("id", productId)
    .eq("seller_id", sellerProfileId);

  if (error) {
    throw new SellerProductError("Unable to archive product.");
  }
}
