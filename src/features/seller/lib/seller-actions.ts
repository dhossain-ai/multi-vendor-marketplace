"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSellerRole, requireApprovedSeller } from "@/lib/auth/guards";
import {
  createSellerProduct,
  updateSellerProduct,
  archiveSellerProduct,
  SellerProductError,
} from "@/features/seller/lib/seller-product-repository";
import type { SellerProductFormData } from "@/features/seller/types";

function parseProductFormData(formData: FormData): SellerProductFormData {
  const title = (formData.get("title") as string | null) ?? "";
  const slug = (formData.get("slug") as string | null) ?? "";
  const description = (formData.get("description") as string | null) ?? "";
  const shortDescription = (formData.get("shortDescription") as string | null) ?? "";
  const priceAmount = parseFloat((formData.get("priceAmount") as string | null) ?? "0");
  const currencyCode = (formData.get("currencyCode") as string | null) ?? "USD";
  const stockQuantityRaw = formData.get("stockQuantity") as string | null;
  const isUnlimitedStock = formData.get("isUnlimitedStock") === "on";
  const status = (formData.get("status") as string | null) === "active" ? "active" as const : "draft" as const;
  const categoryId = (formData.get("categoryId") as string | null) || null;
  const thumbnailUrl = (formData.get("thumbnailUrl") as string | null) || null;

  return {
    title: title.trim(),
    slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-"),
    description: description.trim(),
    shortDescription: shortDescription.trim(),
    priceAmount: isNaN(priceAmount) ? 0 : priceAmount,
    currencyCode,
    stockQuantity: isUnlimitedStock ? null : (stockQuantityRaw ? parseInt(stockQuantityRaw, 10) : null),
    isUnlimitedStock,
    status,
    categoryId,
    thumbnailUrl,
  };
}

function validateProductForm(data: SellerProductFormData): string | null {
  if (!data.title || data.title.length < 2) {
    return "Product title must be at least 2 characters.";
  }

  if (!data.slug || data.slug.length < 2) {
    return "Product slug must be at least 2 characters.";
  }

  if (data.priceAmount <= 0) {
    return "Price must be greater than zero.";
  }

  if (data.priceAmount > 999999) {
    return "Price exceeds maximum allowed value.";
  }

  return null;
}

export async function createProductAction(formData: FormData) {
  const session = await requireSellerRole("/seller/products");
  requireApprovedSeller(session);

  const sellerProfileId = session.sellerProfile?.id;

  if (!sellerProfileId) {
    redirect("/seller?error=" + encodeURIComponent("Seller profile not found."));
  }

  const data = parseProductFormData(formData);
  const validationError = validateProductForm(data);

  if (validationError) {
    redirect("/seller/products/new?error=" + encodeURIComponent(validationError));
  }

  try {
    await createSellerProduct(sellerProfileId, data);

    revalidatePath("/seller/products");
    revalidatePath("/seller");
    revalidatePath("/");

    redirect("/seller/products?notice=" + encodeURIComponent("Product created successfully."));
  } catch (error) {
    if (error instanceof Error && "digest" in error) {
      throw error;
    }

    const message =
      error instanceof SellerProductError
        ? error.message
        : "Unable to create product.";

    redirect("/seller/products/new?error=" + encodeURIComponent(message));
  }
}

export async function updateProductAction(productId: string, formData: FormData) {
  const session = await requireSellerRole("/seller/products");
  requireApprovedSeller(session);

  const sellerProfileId = session.sellerProfile?.id;

  if (!sellerProfileId) {
    redirect("/seller?error=" + encodeURIComponent("Seller profile not found."));
  }

  const data = parseProductFormData(formData);
  const validationError = validateProductForm(data);

  if (validationError) {
    redirect(`/seller/products/${productId}/edit?error=` + encodeURIComponent(validationError));
  }

  try {
    await updateSellerProduct(sellerProfileId, productId, data);

    revalidatePath("/seller/products");
    revalidatePath(`/seller/products/${productId}/edit`);
    revalidatePath("/seller");
    revalidatePath("/");

    redirect("/seller/products?notice=" + encodeURIComponent("Product updated successfully."));
  } catch (error) {
    if (error instanceof Error && "digest" in error) {
      throw error;
    }

    const message =
      error instanceof SellerProductError
        ? error.message
        : "Unable to update product.";

    redirect(`/seller/products/${productId}/edit?error=` + encodeURIComponent(message));
  }
}

export async function archiveProductAction(productId: string) {
  const session = await requireSellerRole("/seller/products");
  requireApprovedSeller(session);

  const sellerProfileId = session.sellerProfile?.id;

  if (!sellerProfileId) {
    redirect("/seller?error=" + encodeURIComponent("Seller profile not found."));
  }

  try {
    await archiveSellerProduct(sellerProfileId, productId);

    revalidatePath("/seller/products");
    revalidatePath("/seller");
    revalidatePath("/");

    redirect("/seller/products?notice=" + encodeURIComponent("Product archived."));
  } catch (error) {
    if (error instanceof Error && "digest" in error) {
      throw error;
    }

    redirect("/seller/products?error=" + encodeURIComponent("Unable to archive product."));
  }
}
