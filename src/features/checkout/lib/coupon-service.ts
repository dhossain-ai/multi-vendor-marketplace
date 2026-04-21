import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseServiceRoleEnv } from "@/lib/config/env";

type CouponRow = {
  id?: string | null;
  code?: string | null;
  type?: "fixed" | "percentage" | null;
  value_amount?: number | string | null;
  minimum_order_amount?: number | string | null;
  usage_limit_total?: number | null;
  usage_limit_per_user?: number | null;
  starts_at?: string | null;
  expires_at?: string | null;
  is_active?: boolean | null;
  seller_id?: string | null;
};

type CouponOrderCountRow = {
  customer_id?: string | null;
};

export type CouponEvaluationItem = {
  cartItemId: string;
  sellerId: string;
  lineSubtotalAmount: number;
};

export type AppliedCoupon = {
  id: string;
  code: string;
  type: "fixed" | "percentage";
  sellerId: string | null;
  discountAmount: number;
  applicableSubtotalAmount: number;
  message: string;
  isValid: boolean;
};

const getCouponClient = async () =>
  hasSupabaseServiceRoleEnv()
    ? createSupabaseAdminClient()
    : createSupabaseServerClient();

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

const mapCouponRow = (row: CouponRow): CouponRow | null => {
  if (!row.id || !row.code || !row.type || row.value_amount == null) {
    return null;
  }

  return row;
};

async function getCouponUsageCounts(couponId: string, userId: string) {
  const client = await getCouponClient();
  const { data, error } = await client
    .from("orders")
    .select("customer_id")
    .eq("coupon_id", couponId)
    .neq("payment_status", "failed")
    .neq("order_status", "cancelled");

  if (error) {
    throw new Error("Unable to validate coupon usage limits.");
  }

  const rows = (data as CouponOrderCountRow[]) ?? [];

  return {
    totalUsed: rows.length,
    usedByCurrentUser: rows.filter((row) => row.customer_id === userId).length,
  };
}

async function loadCoupon(input: { couponId?: string | null; code?: string | null }) {
  const client = await getCouponClient();

  if (input.couponId) {
    const { data, error } = await client
      .from("coupons")
      .select(
        "id, code, type, value_amount, minimum_order_amount, usage_limit_total, usage_limit_per_user, starts_at, expires_at, is_active, seller_id",
      )
      .eq("id", input.couponId)
      .maybeSingle();

    if (error) {
      throw new Error("Unable to load the selected coupon.");
    }

    return data ? mapCouponRow(data as CouponRow) : null;
  }

  const normalizedCode = input.code?.trim().toUpperCase();

  if (!normalizedCode) {
    return null;
  }

  const { data, error } = await client
    .from("coupons")
    .select(
      "id, code, type, value_amount, minimum_order_amount, usage_limit_total, usage_limit_per_user, starts_at, expires_at, is_active, seller_id",
    )
    .eq("code", normalizedCode)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load that coupon code.");
  }

  return data ? mapCouponRow(data as CouponRow) : null;
}

const getApplicableSubtotal = (
  items: CouponEvaluationItem[],
  sellerId: string | null,
) => roundCurrency(
  items
    .filter((item) => !sellerId || item.sellerId === sellerId)
    .reduce((sum, item) => sum + item.lineSubtotalAmount, 0),
);

export async function evaluateCoupon(input: {
  userId: string;
  items: CouponEvaluationItem[];
  subtotalAmount: number;
  couponId?: string | null;
  code?: string | null;
}): Promise<AppliedCoupon | null> {
  if (!input.couponId && !input.code) {
    return null;
  }

  const coupon = await loadCoupon({
    couponId: input.couponId ?? null,
    code: input.code ?? null,
  });

  if (!coupon?.id || !coupon.code || !coupon.type || coupon.value_amount == null) {
    return {
      id: input.couponId ?? "missing",
      code: (input.code ?? "Coupon").toUpperCase(),
      type: "fixed",
      sellerId: null,
      discountAmount: 0,
      applicableSubtotalAmount: 0,
      message: "That coupon code could not be found.",
      isValid: false,
    };
  }

  const applicableSubtotal = getApplicableSubtotal(input.items, coupon.seller_id ?? null);
  const now = new Date();
  const startsAt = coupon.starts_at ? new Date(coupon.starts_at) : null;
  const expiresAt = coupon.expires_at ? new Date(coupon.expires_at) : null;

  if (coupon.is_active === false) {
    return {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      sellerId: coupon.seller_id ?? null,
      discountAmount: 0,
      applicableSubtotalAmount: applicableSubtotal,
      message: "This coupon is not active right now.",
      isValid: false,
    };
  }

  if (startsAt && startsAt > now) {
    return {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      sellerId: coupon.seller_id ?? null,
      discountAmount: 0,
      applicableSubtotalAmount: applicableSubtotal,
      message: "This coupon has not started yet.",
      isValid: false,
    };
  }

  if (expiresAt && expiresAt < now) {
    return {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      sellerId: coupon.seller_id ?? null,
      discountAmount: 0,
      applicableSubtotalAmount: applicableSubtotal,
      message: "This coupon has expired.",
      isValid: false,
    };
  }

  if (applicableSubtotal <= 0) {
    return {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      sellerId: coupon.seller_id ?? null,
      discountAmount: 0,
      applicableSubtotalAmount: applicableSubtotal,
      message: "This coupon does not apply to the current cart.",
      isValid: false,
    };
  }

  const minimumOrderAmount =
    coupon.minimum_order_amount == null ? null : Number(coupon.minimum_order_amount);

  if (minimumOrderAmount != null && applicableSubtotal < minimumOrderAmount) {
    return {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      sellerId: coupon.seller_id ?? null,
      discountAmount: 0,
      applicableSubtotalAmount: applicableSubtotal,
      message: `This coupon requires at least ${minimumOrderAmount.toFixed(2)} in eligible items.`,
      isValid: false,
    };
  }

  const usage = await getCouponUsageCounts(coupon.id, input.userId);

  if (
    coupon.usage_limit_total != null &&
    usage.totalUsed >= coupon.usage_limit_total
  ) {
    return {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      sellerId: coupon.seller_id ?? null,
      discountAmount: 0,
      applicableSubtotalAmount: applicableSubtotal,
      message: "This coupon has reached its total usage limit.",
      isValid: false,
    };
  }

  if (
    coupon.usage_limit_per_user != null &&
    usage.usedByCurrentUser >= coupon.usage_limit_per_user
  ) {
    return {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      sellerId: coupon.seller_id ?? null,
      discountAmount: 0,
      applicableSubtotalAmount: applicableSubtotal,
      message: "You have already used this coupon as many times as allowed.",
      isValid: false,
    };
  }

  const rawDiscount =
    coupon.type === "percentage"
      ? applicableSubtotal * (Number(coupon.value_amount) / 100)
      : Number(coupon.value_amount);
  const discountAmount = roundCurrency(
    Math.min(applicableSubtotal, Math.max(rawDiscount, 0)),
  );

  if (discountAmount <= 0) {
    return {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      sellerId: coupon.seller_id ?? null,
      discountAmount: 0,
      applicableSubtotalAmount: applicableSubtotal,
      message: "This coupon does not reduce the current cart total.",
      isValid: false,
    };
  }

  return {
    id: coupon.id,
    code: coupon.code,
    type: coupon.type,
    sellerId: coupon.seller_id ?? null,
    discountAmount,
    applicableSubtotalAmount: applicableSubtotal,
    message:
      coupon.seller_id != null
        ? `${coupon.code} applies to eligible items from one seller.`
        : `${coupon.code} is applied to this order.`,
    isValid: true,
  };
}
