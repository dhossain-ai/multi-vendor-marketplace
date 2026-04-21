import { getAdminDataClient } from "@/features/admin/lib/admin-client";
import { recordAdminAuditLog } from "@/features/admin/lib/admin-audit-repository";
import type { AdminProduct, AdminProductStatus, AdminSellerStatus } from "@/features/admin/types";

type SellerRow = {
  store_name?: string | null;
  status?: AdminSellerStatus | null;
};

type CategoryRow = {
  name?: string | null;
};

type ProductRow = {
  id?: string | null;
  seller_id?: string | null;
  category_id?: string | null;
  title?: string | null;
  slug?: string | null;
  price_amount?: number | string | null;
  currency_code?: string | null;
  stock_quantity?: number | null;
  is_unlimited_stock?: boolean | null;
  status?: AdminProductStatus | null;
  thumbnail_url?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  seller_profiles?: SellerRow | SellerRow[] | null;
  categories?: CategoryRow | CategoryRow[] | null;
};

const normalizeJoinedRecord = <T>(value: T | T[] | null | undefined) => {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
};

const mapProductRow = (row: ProductRow): AdminProduct | null => {
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

  const seller = normalizeJoinedRecord(row.seller_profiles);
  const category = normalizeJoinedRecord(row.categories);

  return {
    id: row.id,
    sellerId: row.seller_id,
    sellerName: seller?.store_name ?? null,
    sellerStatus: seller?.status ?? null,
    categoryId: row.category_id ?? null,
    categoryName: category?.name ?? null,
    title: row.title,
    slug: row.slug,
    priceAmount: Number(row.price_amount),
    currencyCode: row.currency_code,
    stockQuantity: row.stock_quantity ?? null,
    isUnlimitedStock: Boolean(row.is_unlimited_stock),
    status: row.status,
    thumbnailUrl: row.thumbnail_url ?? null,
    publishedAt: row.published_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export class AdminProductError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminProductError";
  }
}

const productSelect = `
  id,
  seller_id,
  category_id,
  title,
  slug,
  price_amount,
  currency_code,
  stock_quantity,
  is_unlimited_stock,
  status,
  thumbnail_url,
  published_at,
  created_at,
  updated_at,
  seller_profiles!products_seller_id_fkey (
    store_name,
    status
  ),
  categories (
    name
  )
`;

export async function getAdminProducts(status?: AdminProductStatus | null) {
  const client = await getAdminDataClient();
  let query = client
    .from("products")
    .select(productSelect)
    .order("updated_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw new AdminProductError("Unable to load products.");
  }

  return ((data as ProductRow[]) ?? [])
    .map(mapProductRow)
    .filter((product): product is AdminProduct => Boolean(product));
}

export async function updateProductModerationStatus(input: {
  adminUserId: string;
  productId: string;
  action: "suspend" | "reactivate";
  reason?: string | null;
}) {
  const client = await getAdminDataClient();
  const { data: existing, error: existingError } = await client
    .from("products")
    .select(productSelect)
    .eq("id", input.productId)
    .maybeSingle();

  if (existingError) {
    throw new AdminProductError("Unable to load product moderation state.");
  }

  const existingProduct = existing ? mapProductRow(existing as ProductRow) : null;

  if (!existingProduct) {
    throw new AdminProductError("Product not found.");
  }

  const nextStatus =
    input.action === "suspend"
      ? "suspended"
      : existingProduct.status === "suspended"
        ? "draft"
        : null;

  if (!nextStatus) {
    throw new AdminProductError("Only suspended products can be reactivated.");
  }

  if (input.action === "suspend" && !["draft", "active"].includes(existingProduct.status)) {
    throw new AdminProductError("Only draft or active products can be suspended.");
  }

  const updateData: {
    status: AdminProductStatus;
    published_at?: string | null;
  } = {
    status: nextStatus,
  };

  if (nextStatus === "draft") {
    updateData.published_at = null;
  }

  const { data: updated, error: updateError } = await client
    .from("products")
    .update(updateData)
    .eq("id", input.productId)
    .select(productSelect)
    .single();

  if (updateError) {
    throw new AdminProductError("Unable to update product moderation status.");
  }

  const updatedProduct = mapProductRow(updated as ProductRow);

  if (!updatedProduct) {
    throw new AdminProductError("Updated product could not be read.");
  }

  await recordAdminAuditLog({
    adminUserId: input.adminUserId,
    actionType: "product_status_changed",
    targetTable: "products",
    targetId: updatedProduct.id,
    beforeData: existing,
    afterData: updated,
    reason: input.reason ?? null,
  });

  return updatedProduct;
}
