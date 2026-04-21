import { getAdminDataClient } from "@/features/admin/lib/admin-client";
import { recordAdminAuditLog } from "@/features/admin/lib/admin-audit-repository";
import type { AdminCategory, AdminCategoryWriteInput } from "@/features/admin/types";

type CategoryRow = {
  id?: string | null;
  name?: string | null;
  slug?: string | null;
  parent_id?: string | null;
  is_active?: boolean | null;
  sort_order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type ProductCountRow = {
  category_id?: string | null;
  status?: string | null;
};

const mapCategoryRow = (
  row: CategoryRow,
  parentNameById: Map<string, string>,
  countsById: Map<string, { total: number; active: number }>,
): AdminCategory | null => {
  if (
    !row.id ||
    !row.name ||
    !row.slug ||
    row.is_active == null ||
    row.sort_order == null ||
    !row.created_at ||
    !row.updated_at
  ) {
    return null;
  }

  const counts = countsById.get(row.id) ?? { total: 0, active: 0 };

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    parentId: row.parent_id ?? null,
    parentName: row.parent_id ? (parentNameById.get(row.parent_id) ?? null) : null,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    activeProductCount: counts.active,
    totalProductCount: counts.total,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export class AdminCategoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminCategoryError";
  }
}

export async function getAdminCategories() {
  const client = await getAdminDataClient();
  const { data, error } = await client
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new AdminCategoryError("Unable to load categories.");
  }

  const categoryRows = (data as CategoryRow[]) ?? [];
  const categoryIds = categoryRows.flatMap((row) => (row.id ? [row.id] : []));
  const parentNameById = new Map<string, string>();
  const countsById = new Map<string, { total: number; active: number }>();

  for (const row of categoryRows) {
    if (row.id && row.name) {
      parentNameById.set(row.id, row.name);
    }
  }

  if (categoryIds.length > 0) {
    const { data: productCounts, error: productCountError } = await client
      .from("products")
      .select("category_id, status")
      .in("category_id", categoryIds);

    if (productCountError) {
      throw new AdminCategoryError("Unable to load category product counts.");
    }

    for (const row of (productCounts as ProductCountRow[]) ?? []) {
      if (!row.category_id) {
        continue;
      }

      const current = countsById.get(row.category_id) ?? { total: 0, active: 0 };
      current.total += 1;
      if (row.status === "active") {
        current.active += 1;
      }
      countsById.set(row.category_id, current);
    }
  }

  return categoryRows
    .map((row) => mapCategoryRow(row, parentNameById, countsById))
    .filter((category): category is AdminCategory => Boolean(category));
}

export async function createCategory(input: {
  adminUserId: string;
  category: AdminCategoryWriteInput;
  reason?: string | null;
}) {
  const client = await getAdminDataClient();
  const { data, error } = await client
    .from("categories")
    .insert({
      name: input.category.name,
      slug: input.category.slug,
      parent_id: input.category.parentId,
      is_active: input.category.isActive,
      sort_order: input.category.sortOrder,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new AdminCategoryError("A category with this slug already exists.");
    }
    throw new AdminCategoryError("Unable to create category.");
  }

  await recordAdminAuditLog({
    adminUserId: input.adminUserId,
    actionType: "category_created",
    targetTable: "categories",
    targetId: data.id,
    afterData: data,
    reason: input.reason ?? null,
  });
}

export async function updateCategory(input: {
  adminUserId: string;
  categoryId: string;
  category: AdminCategoryWriteInput;
  reason?: string | null;
}) {
  const client = await getAdminDataClient();
  const { data: existing, error: existingError } = await client
    .from("categories")
    .select("*")
    .eq("id", input.categoryId)
    .maybeSingle();

  if (existingError) {
    throw new AdminCategoryError("Unable to load category.");
  }

  if (!existing?.id) {
    throw new AdminCategoryError("Category not found.");
  }

  if (input.category.parentId === input.categoryId) {
    throw new AdminCategoryError("A category cannot be its own parent.");
  }

  const { data: updated, error: updateError } = await client
    .from("categories")
    .update({
      name: input.category.name,
      slug: input.category.slug,
      parent_id: input.category.parentId,
      is_active: input.category.isActive,
      sort_order: input.category.sortOrder,
    })
    .eq("id", input.categoryId)
    .select("*")
    .single();

  if (updateError) {
    if (updateError.code === "23505") {
      throw new AdminCategoryError("A category with this slug already exists.");
    }
    throw new AdminCategoryError("Unable to update category.");
  }

  await recordAdminAuditLog({
    adminUserId: input.adminUserId,
    actionType: "category_updated",
    targetTable: "categories",
    targetId: input.categoryId,
    beforeData: existing,
    afterData: updated,
    reason: input.reason ?? null,
  });
}

export async function archiveCategory(input: {
  adminUserId: string;
  categoryId: string;
  reason?: string | null;
}) {
  const client = await getAdminDataClient();
  const { data: existing, error: existingError } = await client
    .from("categories")
    .select("*")
    .eq("id", input.categoryId)
    .maybeSingle();

  if (existingError) {
    throw new AdminCategoryError("Unable to load category.");
  }

  if (!existing?.id) {
    throw new AdminCategoryError("Category not found.");
  }

  const { data: updated, error: updateError } = await client
    .from("categories")
    .update({ is_active: false })
    .eq("id", input.categoryId)
    .select("*")
    .single();

  if (updateError) {
    throw new AdminCategoryError("Unable to archive category.");
  }

  await recordAdminAuditLog({
    adminUserId: input.adminUserId,
    actionType: "category_archived",
    targetTable: "categories",
    targetId: input.categoryId,
    beforeData: existing,
    afterData: updated,
    reason: input.reason ?? null,
  });
}
