import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseServiceRoleEnv } from "@/lib/config/env";

export const getAdminDataClient = async () =>
  hasSupabaseServiceRoleEnv()
    ? createSupabaseAdminClient()
    : createSupabaseServerClient();
