import { getAdminDataClient } from "@/features/admin/lib/admin-client";
import { recordAdminAuditLog } from "@/features/admin/lib/admin-audit-repository";
import type { AdminSeller, AdminSellerStatus } from "@/features/admin/types";

type ProfileRow = {
  email?: string | null;
  full_name?: string | null;
};

type SellerRow = {
  id?: string | null;
  user_id?: string | null;
  store_name?: string | null;
  slug?: string | null;
  status?: AdminSellerStatus | null;
  bio?: string | null;
  logo_url?: string | null;
  approved_at?: string | null;
  approved_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  profiles?: ProfileRow | ProfileRow[] | null;
};

const normalizeJoinedRecord = <T>(value: T | T[] | null | undefined) => {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
};

const mapSellerRow = (
  row: SellerRow,
  productCounts: Map<string, number>,
): AdminSeller | null => {
  if (
    !row.id ||
    !row.user_id ||
    !row.store_name ||
    !row.status ||
    !row.created_at ||
    !row.updated_at
  ) {
    return null;
  }

  const owner = normalizeJoinedRecord(row.profiles);

  return {
    id: row.id,
    userId: row.user_id,
    storeName: row.store_name,
    slug: row.slug ?? null,
    status: row.status,
    ownerEmail: owner?.email ?? null,
    ownerName: owner?.full_name ?? null,
    bio: row.bio ?? null,
    logoUrl: row.logo_url ?? null,
    approvedAt: row.approved_at ?? null,
    approvedBy: row.approved_by ?? null,
    productCount: productCounts.get(row.id) ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export class AdminSellerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminSellerError";
  }
}

export async function getAdminSellers(status?: AdminSellerStatus | null) {
  const client = await getAdminDataClient();
  let query = client
    .from("seller_profiles")
    .select(
      `
        id,
        user_id,
        store_name,
        slug,
        status,
        bio,
        logo_url,
        approved_at,
        approved_by,
        created_at,
        updated_at,
        profiles!seller_profiles_user_id_fkey (
          email,
          full_name
        )
      `,
    )
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw new AdminSellerError("Unable to load sellers.");
  }

  const sellerRows = (data as SellerRow[]) ?? [];
  const sellerIds = sellerRows.flatMap((row) => (row.id ? [row.id] : []));
  const productCounts = new Map<string, number>();

  if (sellerIds.length > 0) {
    const { data: products, error: productsError } = await client
      .from("products")
      .select("seller_id")
      .in("seller_id", sellerIds);

    if (productsError) {
      throw new AdminSellerError("Unable to load seller product counts.");
    }

    for (const row of (products as Array<{ seller_id?: string | null }>) ?? []) {
      if (!row.seller_id) {
        continue;
      }

      productCounts.set(row.seller_id, (productCounts.get(row.seller_id) ?? 0) + 1);
    }
  }

  return sellerRows
    .map((row) => mapSellerRow(row, productCounts))
    .filter((seller): seller is AdminSeller => Boolean(seller));
}

const allowedTransitions: Record<AdminSellerStatus, AdminSellerStatus[]> = {
  pending: ["approved", "rejected", "suspended"],
  approved: ["suspended"],
  rejected: ["approved", "suspended"],
  suspended: ["approved", "rejected"],
};

export async function updateSellerStatus(input: {
  adminUserId: string;
  sellerId: string;
  nextStatus: AdminSellerStatus;
  reason?: string | null;
}) {
  const client = await getAdminDataClient();
  const { data: existing, error: existingError } = await client
    .from("seller_profiles")
    .select("*")
    .eq("id", input.sellerId)
    .maybeSingle();

  if (existingError) {
    throw new AdminSellerError("Unable to load seller status.");
  }

  if (!existing?.id || !existing.status) {
    throw new AdminSellerError("Seller profile not found.");
  }

  if (existing.status === input.nextStatus) {
    return existing.status as AdminSellerStatus;
  }

  if (!allowedTransitions[existing.status as AdminSellerStatus].includes(input.nextStatus)) {
    throw new AdminSellerError("That seller status transition is not allowed.");
  }

  const updateData: {
    status: AdminSellerStatus;
    approved_at?: string | null;
    approved_by?: string | null;
  } = {
    status: input.nextStatus,
  };

  if (input.nextStatus === "approved") {
    updateData.approved_at = new Date().toISOString();
    updateData.approved_by = input.adminUserId;
  }

  if (input.nextStatus === "rejected") {
    updateData.approved_at = null;
    updateData.approved_by = null;
  }

  const { data: updated, error: updateError } = await client
    .from("seller_profiles")
    .update(updateData)
    .eq("id", input.sellerId)
    .select("*")
    .single();

  if (updateError || !updated?.id || !updated.status) {
    throw new AdminSellerError("Unable to update seller status.");
  }

  await recordAdminAuditLog({
    adminUserId: input.adminUserId,
    actionType: "seller_status_changed",
    targetTable: "seller_profiles",
    targetId: updated.id,
    beforeData: existing,
    afterData: updated,
    reason: input.reason ?? null,
  });

  return updated.status as AdminSellerStatus;
}
