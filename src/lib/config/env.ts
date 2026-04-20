const getRequiredEnv = (key: string) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const hasEnv = (key: string) => Boolean(process.env[key]);

export const hasSupabasePublicEnv = () =>
  hasEnv("NEXT_PUBLIC_SUPABASE_URL") && hasEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

export const hasSupabaseServiceRoleEnv = () =>
  hasSupabasePublicEnv() && hasEnv("SUPABASE_SERVICE_ROLE_KEY");

export const getSupabasePublicEnv = () => ({
  url: getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
  anonKey: getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
});

export const getSupabaseServiceRoleKey = () =>
  getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

export const hasStripeEnv = () =>
  hasEnv("STRIPE_SECRET_KEY") && hasEnv("STRIPE_WEBHOOK_SECRET");

export const getStripeSecretKey = () =>
  getRequiredEnv("STRIPE_SECRET_KEY");

export const getStripeWebhookSecret = () =>
  getRequiredEnv("STRIPE_WEBHOOK_SECRET");
