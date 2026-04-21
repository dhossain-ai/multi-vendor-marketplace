import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseServiceRoleEnv } from "@/lib/config/env";
import type { Database } from "@/types/database";
import type { SellerProfile } from "@/types/auth";
import type { SellerStoreProfileFormData } from "@/features/seller/types";

type SellerProfileRow = Database["public"]["Tables"]["seller_profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

const getSellerClient = async () =>
  hasSupabaseServiceRoleEnv()
    ? createSupabaseAdminClient()
    : createSupabaseServerClient();

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

export class SellerProfileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SellerProfileError";
  }
}

async function updateProfileRole(userId: string, role: ProfileUpdate["role"]) {
  const client = await getSellerClient();
  const { error } = await client
    .from("profiles")
    .update({ role } satisfies ProfileUpdate)
    .eq("id", userId);

  if (error) {
    throw new SellerProfileError("Unable to update account role for this seller application.");
  }
}

export async function createSellerApplication(input: {
  userId: string;
  currentRole: "customer" | "seller" | "admin";
  storeProfile: SellerStoreProfileFormData;
}): Promise<SellerProfile> {
  if (input.currentRole === "admin") {
    throw new SellerProfileError("Admin accounts cannot apply through the seller onboarding flow.");
  }

  const client = await getSellerClient();
  const { data: existing, error: existingError } = await client
    .from("seller_profiles")
    .select("*")
    .eq("user_id", input.userId)
    .maybeSingle();

  if (existingError) {
    throw new SellerProfileError("Unable to check the current seller application.");
  }

  if (existing) {
    throw new SellerProfileError("A seller profile already exists for this account.");
  }

  await updateProfileRole(input.userId, "seller");

  const { data, error } = await client
    .from("seller_profiles")
    .insert({
      user_id: input.userId,
      store_name: input.storeProfile.storeName,
      slug: input.storeProfile.slug,
      bio: input.storeProfile.bio || null,
      logo_url: input.storeProfile.logoUrl,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) {
    if (input.currentRole === "customer") {
      await updateProfileRole(input.userId, "customer").catch(() => undefined);
    }

    if (error.code === "23505") {
      throw new SellerProfileError("That store slug is already in use.");
    }

    throw new SellerProfileError("Unable to submit the seller application.");
  }

  return mapSellerProfileRow(data);
}

export async function updateSellerProfile(input: {
  userId: string;
  storeProfile: SellerStoreProfileFormData;
}): Promise<SellerProfile> {
  const client = await getSellerClient();
  const { data: existing, error: existingError } = await client
    .from("seller_profiles")
    .select("*")
    .eq("user_id", input.userId)
    .maybeSingle();

  if (existingError) {
    throw new SellerProfileError("Unable to load store settings.");
  }

  if (!existing) {
    throw new SellerProfileError("Seller profile not found.");
  }

  const { data, error } = await client
    .from("seller_profiles")
    .update({
      store_name: input.storeProfile.storeName,
      slug: input.storeProfile.slug,
      bio: input.storeProfile.bio || null,
      logo_url: input.storeProfile.logoUrl,
    })
    .eq("id", existing.id)
    .eq("user_id", input.userId)
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new SellerProfileError("That store slug is already in use.");
    }

    throw new SellerProfileError("Unable to update store settings.");
  }

  return mapSellerProfileRow(data);
}
