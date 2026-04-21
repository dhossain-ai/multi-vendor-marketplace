import { getAdminDataClient } from "@/features/admin/lib/admin-client";
import { recordAdminAuditLog } from "@/features/admin/lib/admin-audit-repository";
import type { AdminCoupon, AdminCouponWriteInput, AdminCouponType } from "@/features/admin/types";
import type { SellerOption } from "@/features/shared/types";

type SellerRow = {
  store_name?: string | null;
};

type CreatorRow = {
  email?: string | null;
};

type CouponRow = {
  id?: string | null;
  code?: string | null;
  type?: AdminCouponType | null;
  value_amount?: number | string | null;
  minimum_order_amount?: number | string | null;
  usage_limit_total?: number | null;
  usage_limit_per_user?: number | null;
  starts_at?: string | null;
  expires_at?: string | null;
  is_active?: boolean | null;
  seller_id?: string | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  seller_profiles?: SellerRow | SellerRow[] | null;
  profiles?: CreatorRow | CreatorRow[] | null;
};

const normalizeJoinedRecord = <T>(value: T | T[] | null | undefined) => {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
};

const mapCouponRow = (row: CouponRow): AdminCoupon | null => {
  if (
    !row.id ||
    !row.code ||
    !row.type ||
    row.value_amount == null ||
    row.is_active == null ||
    !row.created_at ||
    !row.updated_at
  ) {
    return null;
  }

  const seller = normalizeJoinedRecord(row.seller_profiles);
  const creator = normalizeJoinedRecord(row.profiles);

  return {
    id: row.id,
    code: row.code,
    type: row.type,
    valueAmount: Number(row.value_amount),
    minimumOrderAmount:
      row.minimum_order_amount == null ? null : Number(row.minimum_order_amount),
    usageLimitTotal: row.usage_limit_total ?? null,
    usageLimitPerUser: row.usage_limit_per_user ?? null,
    startsAt: row.starts_at ?? null,
    expiresAt: row.expires_at ?? null,
    isActive: row.is_active,
    sellerId: row.seller_id ?? null,
    sellerName: seller?.store_name ?? null,
    createdBy: row.created_by ?? null,
    createdByEmail: creator?.email ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export class AdminCouponError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminCouponError";
  }
}

const couponSelect = `
  id,
  code,
  type,
  value_amount,
  minimum_order_amount,
  usage_limit_total,
  usage_limit_per_user,
  starts_at,
  expires_at,
  is_active,
  seller_id,
  created_by,
  created_at,
  updated_at,
  seller_profiles!coupons_seller_id_fkey (
    store_name
  ),
  profiles!coupons_created_by_fkey (
    email
  )
`;

export async function getAdminCoupons() {
  const client = await getAdminDataClient();
  const { data, error } = await client
    .from("coupons")
    .select(couponSelect)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AdminCouponError("Unable to load coupons.");
  }

  return ((data as CouponRow[]) ?? [])
    .map(mapCouponRow)
    .filter((coupon): coupon is AdminCoupon => Boolean(coupon));
}

export async function getCouponSellerOptions(): Promise<SellerOption[]> {
  const client = await getAdminDataClient();
  const { data, error } = await client
    .from("seller_profiles")
    .select("id, store_name")
    .eq("status", "approved")
    .order("store_name", { ascending: true });

  if (error) {
    throw new AdminCouponError("Unable to load seller coupon scopes.");
  }

  return (((data as Array<{ id?: string | null; store_name?: string | null }>) ?? []).flatMap(
    (row) => {
      if (!row.id || !row.store_name) {
        return [];
      }

      return [
        {
          id: row.id,
          storeName: row.store_name,
        },
      ];
    },
  ));
}

export async function createCoupon(input: {
  adminUserId: string;
  coupon: AdminCouponWriteInput;
  reason?: string | null;
}) {
  const client = await getAdminDataClient();
  const { data, error } = await client
    .from("coupons")
    .insert({
      code: input.coupon.code,
      type: input.coupon.type,
      value_amount: input.coupon.valueAmount,
      minimum_order_amount: input.coupon.minimumOrderAmount,
      usage_limit_total: input.coupon.usageLimitTotal,
      usage_limit_per_user: input.coupon.usageLimitPerUser,
      starts_at: input.coupon.startsAt,
      expires_at: input.coupon.expiresAt,
      is_active: input.coupon.isActive,
      seller_id: input.coupon.sellerId,
      created_by: input.adminUserId,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new AdminCouponError("A coupon with this code already exists.");
    }
    throw new AdminCouponError("Unable to create coupon.");
  }

  await recordAdminAuditLog({
    adminUserId: input.adminUserId,
    actionType: "coupon_created",
    targetTable: "coupons",
    targetId: data.id,
    afterData: data,
    reason: input.reason ?? null,
  });
}

export async function updateCoupon(input: {
  adminUserId: string;
  couponId: string;
  coupon: AdminCouponWriteInput;
  reason?: string | null;
}) {
  const client = await getAdminDataClient();
  const { data: existing, error: existingError } = await client
    .from("coupons")
    .select("*")
    .eq("id", input.couponId)
    .maybeSingle();

  if (existingError) {
    throw new AdminCouponError("Unable to load coupon.");
  }

  if (!existing?.id) {
    throw new AdminCouponError("Coupon not found.");
  }

  const { data: updated, error: updateError } = await client
    .from("coupons")
    .update({
      code: input.coupon.code,
      type: input.coupon.type,
      value_amount: input.coupon.valueAmount,
      minimum_order_amount: input.coupon.minimumOrderAmount,
      usage_limit_total: input.coupon.usageLimitTotal,
      usage_limit_per_user: input.coupon.usageLimitPerUser,
      starts_at: input.coupon.startsAt,
      expires_at: input.coupon.expiresAt,
      is_active: input.coupon.isActive,
      seller_id: input.coupon.sellerId,
    })
    .eq("id", input.couponId)
    .select("*")
    .single();

  if (updateError) {
    if (updateError.code === "23505") {
      throw new AdminCouponError("A coupon with this code already exists.");
    }
    throw new AdminCouponError("Unable to update coupon.");
  }

  await recordAdminAuditLog({
    adminUserId: input.adminUserId,
    actionType: "coupon_updated",
    targetTable: "coupons",
    targetId: input.couponId,
    beforeData: existing,
    afterData: updated,
    reason: input.reason ?? null,
  });
}

export async function updateCouponStatus(input: {
  adminUserId: string;
  couponId: string;
  isActive: boolean;
  reason?: string | null;
}) {
  const client = await getAdminDataClient();
  const { data: existing, error: existingError } = await client
    .from("coupons")
    .select("*")
    .eq("id", input.couponId)
    .maybeSingle();

  if (existingError) {
    throw new AdminCouponError("Unable to load coupon.");
  }

  if (!existing?.id) {
    throw new AdminCouponError("Coupon not found.");
  }

  const { data: updated, error: updateError } = await client
    .from("coupons")
    .update({ is_active: input.isActive })
    .eq("id", input.couponId)
    .select("*")
    .single();

  if (updateError) {
    throw new AdminCouponError("Unable to update coupon status.");
  }

  await recordAdminAuditLog({
    adminUserId: input.adminUserId,
    actionType: "coupon_status_changed",
    targetTable: "coupons",
    targetId: input.couponId,
    beforeData: existing,
    afterData: updated,
    reason: input.reason ?? null,
  });
}
