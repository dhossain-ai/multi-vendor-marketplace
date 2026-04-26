import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseServiceRoleEnv } from "@/lib/config/env";
import type { Database } from "@/types/database";
import type { SellerProfile } from "@/types/auth";
import type {
  SellerApplicationFormData,
  SellerStoreProfileFormData,
} from "@/features/seller/types";

type SellerProfileRow = Database["public"]["Tables"]["seller_profiles"]["Row"];
type SellerProfileInsert = Database["public"]["Tables"]["seller_profiles"]["Insert"];
type SellerProfileUpdate = Database["public"]["Tables"]["seller_profiles"]["Update"];
type SellerStatusHistoryInsert =
  Database["public"]["Tables"]["seller_status_history"]["Insert"];
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
  supportEmail: row.support_email,
  businessEmail: row.business_email,
  phone: row.phone,
  countryCode: row.country_code,
  agreementAcceptedAt: row.agreement_accepted_at,
  rejectionReason: row.rejection_reason,
  suspensionReason: row.suspension_reason,
  resubmittedAt: row.resubmitted_at,
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

async function recordSellerStatusHistory(
  entry: SellerStatusHistoryInsert,
) {
  const client = await getSellerClient();
  const { error } = await client.from("seller_status_history").insert(entry);

  if (error) {
    console.warn("Failed to record seller status history.", error);
  }
}

const buildApplicationPayload = (
  userId: string,
  data: SellerApplicationFormData,
  submittedAt: string,
): SellerProfileInsert => ({
  user_id: userId,
  store_name: data.storeName,
  slug: data.slug,
  bio: data.bio,
  logo_url: data.logoUrl,
  support_email: data.supportEmail,
  business_email: data.businessEmail,
  phone: data.phone,
  country_code: data.countryCode,
  agreement_accepted_at: submittedAt,
  rejection_reason: null,
  suspension_reason: null,
  resubmitted_at: null,
  status: "pending",
});

const buildResubmissionPayload = (
  data: SellerApplicationFormData,
  resubmittedAt: string,
): SellerProfileUpdate => ({
  store_name: data.storeName,
  slug: data.slug,
  bio: data.bio,
  logo_url: data.logoUrl,
  support_email: data.supportEmail,
  business_email: data.businessEmail,
  phone: data.phone,
  country_code: data.countryCode,
  agreement_accepted_at: resubmittedAt,
  rejection_reason: null,
  resubmitted_at: resubmittedAt,
  approved_at: null,
  approved_by: null,
  status: "pending",
});

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

export async function submitSellerApplication(input: {
  userId: string;
  currentRole: "customer" | "seller" | "admin";
  storeProfile: SellerApplicationFormData;
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

  if (existing?.status === "pending") {
    throw new SellerProfileError("Your seller application is already pending review.");
  }

  if (existing?.status === "approved") {
    throw new SellerProfileError("Your seller account is already approved.");
  }

  if (existing?.status === "suspended") {
    throw new SellerProfileError("Your seller account is suspended. Contact marketplace support.");
  }

  if (input.currentRole === "customer") {
    await updateProfileRole(input.userId, "seller");
  }

  const submittedAt = new Date().toISOString();

  if (!existing) {
    const { data, error } = await client
      .from("seller_profiles")
      .insert(buildApplicationPayload(input.userId, input.storeProfile, submittedAt))
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

    await recordSellerStatusHistory({
      seller_id: data.id,
      previous_status: null,
      new_status: "pending",
      changed_by: input.userId,
      reason: "Seller application submitted.",
    });

    return mapSellerProfileRow(data);
  }

  const { data, error } = await client
    .from("seller_profiles")
    .update(buildResubmissionPayload(input.storeProfile, submittedAt))
    .eq("id", existing.id)
    .eq("user_id", input.userId)
    .eq("status", "rejected")
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new SellerProfileError("That store slug is already in use.");
    }

    throw new SellerProfileError("Unable to resubmit the seller application.");
  }

  await recordSellerStatusHistory({
    seller_id: data.id,
    previous_status: "rejected",
    new_status: "pending",
    changed_by: input.userId,
    reason: "Seller application resubmitted.",
  });

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

  if (existing.status === "approved" && input.storeProfile.slug !== existing.slug) {
    throw new SellerProfileError("Store slug changes require marketplace support after approval.");
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
