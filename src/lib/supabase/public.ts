import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/config/env";
import type { Database } from "@/types/database";

export const createSupabasePublicClient = () => {
  const { url, anonKey } = getSupabasePublicEnv();

  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
    },
  });
};
