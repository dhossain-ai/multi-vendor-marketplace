"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminRole } from "@/lib/auth/guards";
import {
  archiveCategory,
  createCategory,
  updateCategory,
  AdminCategoryError,
} from "@/features/admin/lib/admin-category-repository";
import {
  createCoupon,
  updateCoupon,
  updateCouponStatus,
  AdminCouponError,
} from "@/features/admin/lib/admin-coupon-repository";
import {
  updateProductModerationStatus,
  AdminProductError,
} from "@/features/admin/lib/admin-product-repository";
import {
  updateSellerStatus,
  AdminSellerError,
} from "@/features/admin/lib/admin-seller-repository";
import type {
  AdminCategoryWriteInput,
  AdminCouponType,
  AdminCouponWriteInput,
  AdminSellerStatus,
} from "@/features/admin/types";

const buildRedirect = (path: string, key: "notice" | "error", message: string) =>
  `${path}?${key}=${encodeURIComponent(message)}`;

const getRequiredString = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

const getOptionalString = (formData: FormData, key: string) => {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const getBoolean = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return value === "on" || value === "true";
};

const getInteger = (formData: FormData, key: string, fallback = 0) => {
  const raw = getOptionalString(formData, key);

  if (!raw) {
    return fallback;
  }

  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getNullableInteger = (formData: FormData, key: string) => {
  const raw = getOptionalString(formData, key);

  if (!raw) {
    return null;
  }

  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : null;
};

const getNullableMoney = (formData: FormData, key: string) => {
  const raw = getOptionalString(formData, key);

  if (!raw) {
    return null;
  }

  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

const getRequiredMoney = (formData: FormData, key: string) => {
  const parsed = getNullableMoney(formData, key);
  return parsed ?? 0;
};

const getNullableDateTime = (formData: FormData, key: string) => {
  const raw = getOptionalString(formData, key);

  if (!raw) {
    return null;
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const sanitizeSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const validateCategoryInput = (input: AdminCategoryWriteInput) => {
  if (input.name.length < 2) {
    return "Category name must be at least 2 characters.";
  }

  if (input.slug.length < 2) {
    return "Category slug must be at least 2 characters.";
  }

  return null;
};

const validateCouponInput = (input: AdminCouponWriteInput) => {
  if (input.code.length < 3) {
    return "Coupon code must be at least 3 characters.";
  }

  if (input.valueAmount <= 0) {
    return "Coupon value must be greater than zero.";
  }

  if (input.type === "percentage" && input.valueAmount > 100) {
    return "Percentage coupons cannot exceed 100.";
  }

  if (input.minimumOrderAmount != null && input.minimumOrderAmount < 0) {
    return "Minimum order amount cannot be negative.";
  }

  if (input.usageLimitTotal != null && input.usageLimitTotal < 1) {
    return "Total usage limit must be at least 1 when set.";
  }

  if (input.usageLimitPerUser != null && input.usageLimitPerUser < 1) {
    return "Per-user usage limit must be at least 1 when set.";
  }

  if (input.startsAt && input.expiresAt && input.startsAt > input.expiresAt) {
    return "Coupon start date must be before the expiration date.";
  }

  return null;
};

const revalidateAdminShell = () => {
  revalidatePath("/admin");
  revalidatePath("/admin/sellers");
  revalidatePath("/admin/products");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/coupons");
  revalidatePath("/admin/orders");
};

export async function updateSellerStatusAction(formData: FormData) {
  const session = await requireAdminRole("/admin/sellers");
  const sellerId = getRequiredString(formData, "sellerId");
  const nextStatus = getRequiredString(formData, "status") as AdminSellerStatus;

  if (!sellerId || !["approved", "rejected", "suspended"].includes(nextStatus)) {
    redirect(buildRedirect("/admin/sellers", "error", "Invalid seller moderation request."));
  }

  try {
    await updateSellerStatus({
      adminUserId: session.user.id,
      sellerId,
      nextStatus,
      reason: `Admin set seller status to ${nextStatus}.`,
    });

    revalidateAdminShell();
    revalidatePath("/account");
    revalidatePath("/sell");
    revalidatePath("/seller");
    revalidatePath("/seller/settings");
    revalidatePath("/seller/products");
    revalidatePath("/seller/orders");
    revalidatePath("/");
    revalidatePath("/cart");
    revalidatePath("/checkout");

    redirect(
      buildRedirect(
        "/admin/sellers",
        "notice",
        `Seller updated to ${nextStatus}.`,
      ),
    );
  } catch (error) {
    const message =
      error instanceof AdminSellerError
        ? error.message
        : "Unable to update seller status.";

    redirect(buildRedirect("/admin/sellers", "error", message));
  }
}

export async function updateProductModerationAction(formData: FormData) {
  const session = await requireAdminRole("/admin/products");
  const productId = getRequiredString(formData, "productId");
  const action = getRequiredString(formData, "action") as "suspend" | "reactivate";
  const productSlug = getOptionalString(formData, "productSlug");

  if (!productId || !["suspend", "reactivate"].includes(action)) {
    redirect(buildRedirect("/admin/products", "error", "Invalid product moderation request."));
  }

  try {
    await updateProductModerationStatus({
      adminUserId: session.user.id,
      productId,
      action,
      reason:
        action === "suspend"
          ? "Admin suspended the product."
          : "Admin reactivated the product to draft.",
    });

    revalidateAdminShell();
    revalidatePath("/seller");
    revalidatePath("/seller/products");
    revalidatePath("/");
    revalidatePath("/cart");
    revalidatePath("/checkout");

    if (productSlug) {
      revalidatePath(`/products/${productSlug}`);
    }

    redirect(
      buildRedirect(
        "/admin/products",
        "notice",
        action === "suspend"
          ? "Product suspended."
          : "Product reactivated as draft.",
      ),
    );
  } catch (error) {
    const message =
      error instanceof AdminProductError
        ? error.message
        : "Unable to update product moderation status.";

    redirect(buildRedirect("/admin/products", "error", message));
  }
}

export async function createCategoryAction(formData: FormData) {
  const session = await requireAdminRole("/admin/categories");
  const category: AdminCategoryWriteInput = {
    name: getRequiredString(formData, "name"),
    slug: sanitizeSlug(getRequiredString(formData, "slug")),
    parentId: getOptionalString(formData, "parentId"),
    isActive: getBoolean(formData, "isActive"),
    sortOrder: getInteger(formData, "sortOrder", 0),
  };

  const validationError = validateCategoryInput(category);

  if (validationError) {
    redirect(buildRedirect("/admin/categories", "error", validationError));
  }

  try {
    await createCategory({
      adminUserId: session.user.id,
      category,
      reason: "Admin created a category.",
    });

    revalidateAdminShell();
    revalidatePath("/seller/products/new");
    revalidatePath("/");

    redirect(buildRedirect("/admin/categories", "notice", "Category created."));
  } catch (error) {
    const message =
      error instanceof AdminCategoryError
        ? error.message
        : "Unable to create category.";

    redirect(buildRedirect("/admin/categories", "error", message));
  }
}

export async function updateCategoryAction(formData: FormData) {
  const session = await requireAdminRole("/admin/categories");
  const categoryId = getRequiredString(formData, "categoryId");
  const category: AdminCategoryWriteInput = {
    name: getRequiredString(formData, "name"),
    slug: sanitizeSlug(getRequiredString(formData, "slug")),
    parentId: getOptionalString(formData, "parentId"),
    isActive: getBoolean(formData, "isActive"),
    sortOrder: getInteger(formData, "sortOrder", 0),
  };

  const validationError = validateCategoryInput(category);

  if (!categoryId) {
    redirect(buildRedirect("/admin/categories", "error", "Category id is required."));
  }

  if (validationError) {
    redirect(buildRedirect("/admin/categories", "error", validationError));
  }

  try {
    await updateCategory({
      adminUserId: session.user.id,
      categoryId,
      category,
      reason: "Admin updated a category.",
    });

    revalidateAdminShell();
    revalidatePath("/seller/products/new");
    revalidatePath("/");

    redirect(buildRedirect("/admin/categories", "notice", "Category updated."));
  } catch (error) {
    const message =
      error instanceof AdminCategoryError
        ? error.message
        : "Unable to update category.";

    redirect(buildRedirect("/admin/categories", "error", message));
  }
}

export async function archiveCategoryAction(formData: FormData) {
  const session = await requireAdminRole("/admin/categories");
  const categoryId = getRequiredString(formData, "categoryId");

  if (!categoryId) {
    redirect(buildRedirect("/admin/categories", "error", "Category id is required."));
  }

  try {
    await archiveCategory({
      adminUserId: session.user.id,
      categoryId,
      reason: "Admin archived a category.",
    });

    revalidateAdminShell();
    revalidatePath("/seller/products/new");
    revalidatePath("/");
    revalidatePath("/cart");
    revalidatePath("/checkout");

    redirect(buildRedirect("/admin/categories", "notice", "Category archived."));
  } catch (error) {
    const message =
      error instanceof AdminCategoryError
        ? error.message
        : "Unable to archive category.";

    redirect(buildRedirect("/admin/categories", "error", message));
  }
}

const parseCouponType = (formData: FormData) =>
  getRequiredString(formData, "type") as AdminCouponType;

const parseCouponInput = (formData: FormData): AdminCouponWriteInput => ({
  code: getRequiredString(formData, "code").toUpperCase(),
  type: parseCouponType(formData),
  valueAmount: getRequiredMoney(formData, "valueAmount"),
  minimumOrderAmount: getNullableMoney(formData, "minimumOrderAmount"),
  usageLimitTotal: getNullableInteger(formData, "usageLimitTotal"),
  usageLimitPerUser: getNullableInteger(formData, "usageLimitPerUser"),
  startsAt: getNullableDateTime(formData, "startsAt"),
  expiresAt: getNullableDateTime(formData, "expiresAt"),
  isActive: getBoolean(formData, "isActive"),
  sellerId: getOptionalString(formData, "sellerId"),
});

export async function createCouponAction(formData: FormData) {
  const session = await requireAdminRole("/admin/coupons");
  const coupon = parseCouponInput(formData);
  const validationError = validateCouponInput(coupon);

  if (validationError) {
    redirect(buildRedirect("/admin/coupons", "error", validationError));
  }

  try {
    await createCoupon({
      adminUserId: session.user.id,
      coupon,
      reason: "Admin created a coupon.",
    });

    revalidateAdminShell();
    revalidatePath("/checkout");

    redirect(buildRedirect("/admin/coupons", "notice", "Coupon created."));
  } catch (error) {
    const message =
      error instanceof AdminCouponError
        ? error.message
        : "Unable to create coupon.";

    redirect(buildRedirect("/admin/coupons", "error", message));
  }
}

export async function updateCouponAction(formData: FormData) {
  const session = await requireAdminRole("/admin/coupons");
  const couponId = getRequiredString(formData, "couponId");
  const coupon = parseCouponInput(formData);
  const validationError = validateCouponInput(coupon);

  if (!couponId) {
    redirect(buildRedirect("/admin/coupons", "error", "Coupon id is required."));
  }

  if (validationError) {
    redirect(buildRedirect("/admin/coupons", "error", validationError));
  }

  try {
    await updateCoupon({
      adminUserId: session.user.id,
      couponId,
      coupon,
      reason: "Admin updated a coupon.",
    });

    revalidateAdminShell();
    revalidatePath("/checkout");

    redirect(buildRedirect("/admin/coupons", "notice", "Coupon updated."));
  } catch (error) {
    const message =
      error instanceof AdminCouponError
        ? error.message
        : "Unable to update coupon.";

    redirect(buildRedirect("/admin/coupons", "error", message));
  }
}

export async function updateCouponStatusAction(formData: FormData) {
  const session = await requireAdminRole("/admin/coupons");
  const couponId = getRequiredString(formData, "couponId");
  const nextActive = getRequiredString(formData, "isActive") === "true";

  if (!couponId) {
    redirect(buildRedirect("/admin/coupons", "error", "Coupon id is required."));
  }

  try {
    await updateCouponStatus({
      adminUserId: session.user.id,
      couponId,
      isActive: nextActive,
      reason: nextActive ? "Admin activated a coupon." : "Admin deactivated a coupon.",
    });

    revalidateAdminShell();
    revalidatePath("/checkout");

    redirect(
      buildRedirect(
        "/admin/coupons",
        "notice",
        nextActive ? "Coupon activated." : "Coupon deactivated.",
      ),
    );
  } catch (error) {
    const message =
      error instanceof AdminCouponError
        ? error.message
        : "Unable to update coupon status.";

    redirect(buildRedirect("/admin/coupons", "error", message));
  }
}
