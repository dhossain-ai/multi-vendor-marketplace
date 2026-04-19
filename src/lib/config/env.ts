const getRequiredEnv = (key: string) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const getSupabasePublicEnv = () => ({
  url: getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
  anonKey: getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
});

export const getSupabaseServiceRoleKey = () =>
  getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
