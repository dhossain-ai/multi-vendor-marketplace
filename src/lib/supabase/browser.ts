import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/lib/config/env";
import type { Database } from "@/types/database";

export const createSupabaseBrowserClient = () => {
  const { url, anonKey } = getSupabasePublicEnv();

  return createBrowserClient<Database>(url, anonKey);
};
