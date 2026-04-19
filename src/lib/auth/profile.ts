import type { User } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabasePublicEnv, hasSupabaseServiceRoleEnv } from "@/lib/config/env";
import type { Database } from "@/types/database";
import type { AppProfile, SellerProfile } from "@/types/auth";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type SellerProfileRow = Database["public"]["Tables"]["seller_profiles"]["Row"];

const mapProfileRow = (row: ProfileRow): AppProfile => ({
  id: row.id,
  email: row.email,
  fullName: row.full_name,
  role: row.role,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapSellerProfileRow = (row: SellerProfileRow): SellerProfile => ({
  id: row.id,
  userId: row.user_id,
  storeName: row.store_name,
  slug: row.slug,
  status: row.status,
  bio: row.bio,
  logoUrl: row.logo_url,
  commissionRateBps: row.commission_rate_bps,
  approvedAt: row.approved_at,
  approvedBy: row.approved_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export async function getProfileByUserId(userId: string): Promise<AppProfile | null> {
  if (!hasSupabaseServiceRoleEnv()) {
    return null;
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load profile.", error);
    return null;
  }

  return data ? mapProfileRow(data) : null;
}

export async function getSellerProfileByUserId(
  userId: string,
): Promise<SellerProfile | null> {
  if (!hasSupabaseServiceRoleEnv()) {
    return null;
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("seller_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load seller profile.", error);
    return null;
  }

  return data ? mapSellerProfileRow(data) : null;
}

export async function ensureProfileForUser(user: User): Promise<AppProfile | null> {
  if (!hasSupabasePublicEnv() || !hasSupabaseServiceRoleEnv()) {
    return null;
  }

  const existingProfile = await getProfileByUserId(user.id);

  if (existingProfile) {
    const nextEmail = user.email ?? existingProfile.email;
    const nextFullName =
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : existingProfile.fullName;

    if (
      nextEmail !== existingProfile.email ||
      nextFullName !== existingProfile.fullName
    ) {
      const admin = createSupabaseAdminClient();
      const { data, error } = await admin
        .from("profiles")
        .update({
          email: nextEmail,
          full_name: nextFullName,
        })
        .eq("id", user.id)
        .select("*")
        .single();

      if (error) {
        console.error("Failed to refresh profile metadata.", error);
        return existingProfile;
      }

      return mapProfileRow(data);
    }

    return existingProfile;
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email ?? "",
      full_name:
        typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : null,
      role: "customer",
      is_active: true,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Failed to create profile.", error);
    return null;
  }

  return mapProfileRow(data);
}
