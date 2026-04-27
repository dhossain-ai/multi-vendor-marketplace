"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthenticatedUser, requireSellerRole, requireApprovedSeller } from "@/lib/auth/guards";
import { getActiveCategoryOptions } from "@/features/shared/lib/category-repository";
import {
  createSellerApplication,
  submitSellerApplication,
  updateSellerProfile,
  SellerProfileError,
} from "@/features/seller/lib/seller-profile-repository";
import {
  createSellerProduct,
  updateSellerProduct,
  archiveSellerProduct,
  SellerProductError,
} from "@/features/seller/lib/seller-product-repository";
import {
  SellerOrderError,
  updateSellerOrderFulfillment,
} from "@/features/seller/lib/seller-order-repository";
import type {
  SellerApplicationFormData,
  SellerProductFormData,
  SellerStoreProfileFormData,
} from "@/features/seller/types";

const sanitizeSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const isValidHttpUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

function parseStoreProfileFormData(formData: FormData): SellerStoreProfileFormData {
  const storeName = (formData.get("storeName") as string | null) ?? "";
  const slug = (formData.get("slug") as string | null) ?? "";
  const bio = (formData.get("bio") as string | null) ?? "";
  const logoUrl = (formData.get("logoUrl") as string | null) || null;
  const supportEmail = (formData.get("supportEmail") as string | null) ?? "";
  const countryCode = (formData.get("countryCode") as string | null) ?? "";
  const businessEmail = (formData.get("businessEmail") as string | null) || null;
  const phone = (formData.get("phone") as string | null) || null;

  return {
    storeName: storeName.trim(),
    slug: sanitizeSlug(slug),
    bio: bio.trim(),
    logoUrl: logoUrl ? logoUrl.trim() : null,
    supportEmail: supportEmail.trim().toLowerCase(),
    countryCode: countryCode.trim().toUpperCase(),
    businessEmail: businessEmail ? businessEmail.trim().toLowerCase() : null,
    phone: phone ? phone.trim() : null,
  };
}

function parseSellerApplicationFormData(formData: FormData): SellerApplicationFormData {
  const storeProfile = parseStoreProfileFormData(formData);

  return {
    ...storeProfile,
    agreementAccepted: formData.get("agreementAccepted") === "on",
  };
}

const looksLikeEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

function validateStoreProfileForm(data: SellerStoreProfileFormData): string | null {
  if (!data.storeName || data.storeName.length < 2) {
    return "Store name must be at least 2 characters.";
  }

  if (!data.slug || data.slug.length < 3) {
    return "Store slug must be at least 3 characters.";
  }

  if (!data.bio || data.bio.length < 20) {
    return "Store description must be at least 20 characters.";
  }

  if (!data.supportEmail || !looksLikeEmail(data.supportEmail)) {
    return "Enter a valid support email for your store.";
  }

  if (data.businessEmail && !looksLikeEmail(data.businessEmail)) {
    return "Business email must be a valid email address.";
  }

  if (!data.countryCode || data.countryCode.length < 2) {
    return "Choose the country where your store operates.";
  }

  if (data.logoUrl && !isValidHttpUrl(data.logoUrl)) {
    return "Logo URL must be a valid http or https address.";
  }

  return null;
}

function validateSellerApplicationForm(data: SellerApplicationFormData): string | null {
  const storeError = validateStoreProfileForm(data);

  if (storeError) {
    return storeError;
  }

  if (!data.agreementAccepted) {
    return "You must accept the seller terms before submitting.";
  }

  return null;
}

function parseProductFormData(formData: FormData): SellerProductFormData {
  const title = (formData.get("title") as string | null) ?? "";
  const slug = (formData.get("slug") as string | null) ?? "";
  const description = (formData.get("description") as string | null) ?? "";
  const shortDescription = (formData.get("shortDescription") as string | null) ?? "";
  const priceAmount = parseFloat((formData.get("priceAmount") as string | null) ?? "0");
  const currencyCode = (formData.get("currencyCode") as string | null) ?? "USD";
  const stockQuantityRaw = formData.get("stockQuantity") as string | null;
  const isUnlimitedStock = formData.get("isUnlimitedStock") === "on";
  const lowStockThresholdRaw = formData.get("lowStockThreshold") as string | null;
  const lowStockThreshold = lowStockThresholdRaw ? parseInt(lowStockThresholdRaw, 10) : 5;
  const status = (formData.get("status") as string | null) === "active" ? "active" as const : "draft" as const;
  const categoryId = (formData.get("categoryId") as string | null) || null;
  const thumbnailUrl = (formData.get("thumbnailUrl") as string | null) || null;
  const galleryImageUrls = ((formData.get("galleryImageUrls") as string | null) ?? "")
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    title: title.trim(),
    slug: sanitizeSlug(slug),
    description: description.trim(),
    shortDescription: shortDescription.trim(),
    priceAmount: isNaN(priceAmount) ? 0 : priceAmount,
    currencyCode,
    stockQuantity: isUnlimitedStock ? null : (stockQuantityRaw ? parseInt(stockQuantityRaw, 10) : null),
    isUnlimitedStock,
    lowStockThreshold: Number.isNaN(lowStockThreshold) ? 5 : lowStockThreshold,
    status,
    categoryId,
    thumbnailUrl,
    galleryImageUrls,
  };
}

async function validateProductForm(data: SellerProductFormData): Promise<string | null> {
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

  if (data.thumbnailUrl && !isValidHttpUrl(data.thumbnailUrl)) {
    return "Thumbnail URL must be a valid http or https address.";
  }

  if (data.galleryImageUrls.some((url) => !isValidHttpUrl(url))) {
    return "Every gallery image URL must be a valid http or https address.";
  }

  if (data.galleryImageUrls.length > 6) {
    return "Add up to 6 gallery image URLs for a product.";
  }

  if (!data.isUnlimitedStock) {
    if (data.stockQuantity == null || Number.isNaN(data.stockQuantity)) {
      return "Set a stock quantity or mark the product as unlimited stock.";
    }

    if (data.stockQuantity < 0) {
      return "Stock quantity cannot be negative.";
    }
  }

  if (Number.isNaN(data.lowStockThreshold) || data.lowStockThreshold < 0) {
    return "Low stock threshold must be zero or a positive number.";
  }

  const categories = await getActiveCategoryOptions();
  const hasCategories = categories.length > 0;

  if (data.categoryId && !categories.some((category) => category.id === data.categoryId)) {
    return "Choose an active category for this product.";
  }

  if (data.status === "active") {
    if (hasCategories && !data.categoryId) {
      return "Choose a category before publishing a product.";
    }

    if (!data.isUnlimitedStock && (data.stockQuantity ?? 0) < 1) {
      return "Active products need at least 1 item in stock or unlimited stock.";
    }

    if (!data.thumbnailUrl && data.galleryImageUrls.length === 0) {
      return "Active products require a thumbnail or at least one gallery image.";
    }
  }

  return null;
}

const buildSellerRedirect = (
  path: string,
  key: "notice" | "error",
  message: string,
) => `${path}?${key}=${encodeURIComponent(message)}`;

export async function createSellerApplicationAction(formData: FormData) {
  const session = await requireAuthenticatedUser("/sell");

  if (!session.profile) {
    redirect(buildSellerRedirect("/account", "error", "Account profile not found."));
  }

  const data = parseStoreProfileFormData(formData);
  const validationError = validateStoreProfileForm(data);

  if (validationError) {
    redirect(buildSellerRedirect("/sell", "error", validationError));
  }

  try {
    await createSellerApplication({
      userId: session.user.id,
      currentRole: session.profile.role,
      storeProfile: data,
    });

    revalidatePath("/account");
    revalidatePath("/sell");
    revalidatePath("/seller");
    revalidatePath("/seller/settings");
    revalidatePath("/");

    redirect(
      buildSellerRedirect(
        "/seller/settings",
        "notice",
        "Your seller application has been submitted. You can keep refining your store profile while it is reviewed.",
      ),
    );
  } catch (error) {
    const message =
      error instanceof SellerProfileError
        ? error.message
        : "Unable to submit the seller application.";

    redirect(buildSellerRedirect("/sell", "error", message));
  }
}

export async function submitSellerApplicationAction(formData: FormData) {
  const session = await requireAuthenticatedUser("/seller/register");

  if (!session.profile) {
    redirect(buildSellerRedirect("/account", "error", "Account profile not found."));
  }

  if (session.profile.role === "admin") {
    redirect(
      buildSellerRedirect(
        "/account",
        "error",
        "Admin accounts cannot apply through the seller onboarding flow.",
      ),
    );
  }

  if (session.sellerProfile?.status === "approved") {
    redirect("/seller");
  }

  const data = parseSellerApplicationFormData(formData);
  const validationError = validateSellerApplicationForm(data);

  if (validationError) {
    redirect(buildSellerRedirect("/seller/register", "error", validationError));
  }

  try {
    await submitSellerApplication({
      userId: session.user.id,
      currentRole: session.profile.role,
      storeProfile: data,
    });

    revalidatePath("/account");
    revalidatePath("/sell");
    revalidatePath("/seller/register");
    revalidatePath("/seller");
    revalidatePath("/seller/settings");
    revalidatePath("/admin/sellers");
    revalidatePath("/");

    redirect(
      buildSellerRedirect(
        "/seller/register",
        "notice",
        "Your seller application has been submitted for review.",
      ),
    );
  } catch (error) {
    const message =
      error instanceof SellerProfileError
        ? error.message
        : "Unable to submit the seller application.";

    redirect(buildSellerRedirect("/seller/register", "error", message));
  }
}

export async function updateSellerProfileAction(formData: FormData) {
  const session = await requireSellerRole("/seller/settings");
  const data = parseStoreProfileFormData(formData);
  const validationError = validateStoreProfileForm(data);

  if (validationError) {
    redirect(buildSellerRedirect("/seller/settings", "error", validationError));
  }

  try {
    await updateSellerProfile({
      userId: session.user.id,
      storeProfile: data,
    });

    revalidatePath("/account");
    revalidatePath("/sell");
    revalidatePath("/seller");
    revalidatePath("/seller/settings");
    revalidatePath("/admin/sellers");
    revalidatePath("/");

    redirect(buildSellerRedirect("/seller/settings", "notice", "Store settings saved."));
  } catch (error) {
    const message =
      error instanceof SellerProfileError
        ? error.message
        : "Unable to update store settings.";

    redirect(buildSellerRedirect("/seller/settings", "error", message));
  }
}

export async function createProductAction(formData: FormData) {
  const session = await requireSellerRole("/seller/products");
  requireApprovedSeller(session);

  const sellerProfileId = session.sellerProfile?.id;

  if (!sellerProfileId) {
    redirect("/seller?error=" + encodeURIComponent("Seller profile not found."));
  }

  const data = parseProductFormData(formData);
  const validationError = await validateProductForm(data);

  if (validationError) {
    redirect("/seller/products/new?error=" + encodeURIComponent(validationError));
  }

  try {
    await createSellerProduct(sellerProfileId, data);

    revalidatePath("/seller/products");
    revalidatePath("/seller/settings");
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
  const validationError = await validateProductForm(data);

  if (validationError) {
    redirect(`/seller/products/${productId}/edit?error=` + encodeURIComponent(validationError));
  }

  try {
    await updateSellerProduct(sellerProfileId, productId, data);

    revalidatePath("/seller/products");
    revalidatePath("/seller/settings");
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
    revalidatePath("/seller/settings");
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

export async function updateSellerOrderFulfillmentAction(formData: FormData) {
  const session = await requireSellerRole("/seller/orders");
  requireApprovedSeller(session);

  const sellerProfileId = session.sellerProfile?.id;
  const orderId = String(formData.get("orderId") ?? "").trim();
  const fulfillmentStatus = String(formData.get("fulfillmentStatus") ?? "").trim();
  const trackingCode = String(formData.get("trackingCode") ?? "").trim() || null;
  const shipmentNote = String(formData.get("shipmentNote") ?? "").trim() || null;

  if (trackingCode && trackingCode.length > 100) {
    redirect(
      `/seller/orders/${orderId}?error=` +
        encodeURIComponent("Tracking code cannot exceed 100 characters."),
    );
  }

  if (shipmentNote && shipmentNote.length > 500) {
    redirect(
      `/seller/orders/${orderId}?error=` +
        encodeURIComponent("Shipment note cannot exceed 500 characters."),
    );
  }

  if (!sellerProfileId || !orderId) {
    redirect(
      "/seller/orders?error=" +
        encodeURIComponent("Seller order context could not be resolved."),
    );
  }

  if (
    fulfillmentStatus !== "processing" &&
    fulfillmentStatus !== "shipped" &&
    fulfillmentStatus !== "delivered"
  ) {
    redirect(
      `/seller/orders/${orderId}?error=` +
        encodeURIComponent("Choose a valid fulfillment update."),
    );
  }

  try {
    await updateSellerOrderFulfillment(sellerProfileId, {
      orderId,
      fulfillmentStatus,
      trackingCode,
      shipmentNote,
    });

    revalidatePath("/seller/orders");
    revalidatePath(`/seller/orders/${orderId}`);
    revalidatePath("/orders");
    revalidatePath("/admin/orders");

    redirect(
      `/seller/orders/${orderId}?notice=` +
        encodeURIComponent("Fulfillment update saved."),
    );
  } catch (error) {
    const message =
      error instanceof SellerOrderError
        ? error.message
        : "Unable to update fulfillment for this order.";

    redirect(
      `/seller/orders/${orderId}?error=` + encodeURIComponent(message),
    );
  }
}
