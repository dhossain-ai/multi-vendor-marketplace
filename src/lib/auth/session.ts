import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { hasSupabasePublicEnv } from "@/lib/config/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  ensureProfileForUser,
  getSellerProfileByUserId,
} from "@/lib/auth/profile";
import type { AppProfile, SellerProfile } from "@/types/auth";

export type AuthSessionState = {
  user: User | null;
  profile: AppProfile | null;
  sellerProfile: SellerProfile | null;
};

export const getAuthSessionState = cache(async (): Promise<AuthSessionState> => {
  if (!hasSupabasePublicEnv()) {
    return {
      user: null,
      profile: null,
      sellerProfile: null,
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    if (error) {
      console.error("Failed to load authenticated user.", error);
    }

    return {
      user: null,
      profile: null,
      sellerProfile: null,
    };
  }

  const profile = await ensureProfileForUser(user);
  const sellerProfile = await getSellerProfileByUserId(user.id);

  return {
    user,
    profile,
    sellerProfile,
  };
});
