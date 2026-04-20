import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseServiceRoleEnv } from "@/lib/config/env";
import type { Database, Json } from "@/types/database";
import type { SellerProduct, SellerProductFormData } from "@/features/seller/types";

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
  status?: string | null;
  thumbnail_url?: string | null;
  metadata?: Json | null;
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
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

const mapProductRow = (row: ProductRow): SellerProduct | null => {
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
    title: row.title,
    slug: row.slug,
    description: row.description ?? null,
    shortDescription: row.short_description ?? null,
    priceAmount: Number(row.price_amount),
    currencyCode: row.currency_code,
    stockQuantity: row.stock_quantity ?? null,
    isUnlimitedStock: row.is_unlimited_stock ?? false,
    status: row.status as SellerProduct["status"],
    thumbnailUrl: row.thumbnail_url ?? null,
    metadata: row.metadata ?? {},
    publishedAt: row.published_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

/**
 * List all products owned by the seller (any status).
 */
export async function getSellerProducts(
  sellerProfileId: string,
): Promise<SellerProduct[]> {
  const client = await getSellerClient();

  const { data, error } = await client
    .from("products")
    .select("*")
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
    .select("*")
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
      status: formData.status,
      category_id: formData.categoryId,
      thumbnail_url: formData.thumbnailUrl,
      published_at: formData.status === "active" ? new Date().toISOString() : null,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new SellerProductError("A product with this slug already exists.");
    }
    throw new SellerProductError("Unable to create product.");
  }

  const mapped = mapProductRow(data as ProductRow);

  if (!mapped) {
    throw new SellerProductError("Created product could not be read.");
  }

  return mapped;
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
    status: formData.status,
    category_id: formData.categoryId,
    thumbnail_url: formData.thumbnailUrl,
  };

  // Set published_at when transitioning to active
  if (formData.status === "active") {
    updateData.published_at = new Date().toISOString();
  }

  const { data, error } = await client
    .from("products")
    .update(updateData)
    .eq("id", productId)
    .eq("seller_id", sellerProfileId)
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new SellerProductError("A product with this slug already exists.");
    }
    throw new SellerProductError("Unable to update product.");
  }

  const mapped = mapProductRow(data as ProductRow);

  if (!mapped) {
    throw new SellerProductError("Updated product could not be read.");
  }

  return mapped;
}

/**
 * Archive a product (soft-delete). Ownership-guarded.
 */
export async function archiveSellerProduct(
  sellerProfileId: string,
  productId: string,
): Promise<void> {
  const client = await getSellerClient();

  const { error } = await client
    .from("products")
    .update({ status: "archived" } as Database["public"]["Tables"]["products"]["Update"])
    .eq("id", productId)
    .eq("seller_id", sellerProfileId);

  if (error) {
    throw new SellerProductError("Unable to archive product.");
  }
}
