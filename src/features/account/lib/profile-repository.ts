import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseServiceRoleEnv } from "@/lib/config/env";
import type { Database } from "@/types/database";
import type { AppProfile } from "@/types/auth";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export class ProfileOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProfileOperationError";
  }
}

const getProfileClient = async () =>
  hasSupabaseServiceRoleEnv()
    ? createSupabaseAdminClient()
    : createSupabaseServerClient();

const mapProfileRow = (row: ProfileRow): AppProfile => ({
  id: row.id,
  email: row.email,
  fullName: row.full_name,
  role: row.role,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export async function updateProfileFullName(
  userId: string,
  fullName: string | null,
): Promise<AppProfile> {
  const client = await getProfileClient();
  const { data, error } = await client
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", userId)
    .select("*")
    .single();

  if (error || !data) {
    throw new ProfileOperationError("Unable to update your profile right now.");
  }

  return mapProfileRow(data);
}
