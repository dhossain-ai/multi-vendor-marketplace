import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseServiceRoleEnv } from "@/lib/config/env";
import type { CategoryOption } from "@/features/shared/types";

type CategoryRow = {
  id?: string | null;
  name?: string | null;
  slug?: string | null;
};

const getCategoryClient = async () =>
  hasSupabaseServiceRoleEnv()
    ? createSupabaseAdminClient()
    : createSupabaseServerClient();

export async function getActiveCategoryOptions(): Promise<CategoryOption[]> {
  const client = await getCategoryClient();
  const { data, error } = await client
    .from("categories")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error("Unable to load active categories.");
  }

  return (data as CategoryRow[]).flatMap((row) => {
    if (!row.id || !row.name || !row.slug) {
      return [];
    }

    return [
      {
        id: row.id,
        name: row.name,
        slug: row.slug,
      },
    ];
  });
}
