import { redirect } from "next/navigation";
import { hasSupabasePublicEnv } from "@/lib/config/env";
import { signUpAction } from "@/lib/auth/actions";
import { readSearchParam, sanitizeRedirectPath } from "@/lib/auth/navigation";
import { getAuthSessionState } from "@/lib/auth/session";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthForm } from "@/features/auth/components/auth-form";

type SignUpPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const search = await searchParams;
  const session = await getAuthSessionState();

  if (session.user) {
    redirect("/account");
  }

  return (
    <AuthCard
      eyebrow="Create account"
      title="Start shopping with Northstar Market"
      description="New accounts begin as customer profiles so you can browse, save items to your cart, and place orders right away."
      footerLabel="Already have an account?"
      footerHref="/sign-in"
      footerCta="Sign in"
    >
      <AuthForm
        action={signUpAction}
        submitLabel="Create account"
        includeFullName
        nextPath={sanitizeRedirectPath(readSearchParam(search.next))}
        error={readSearchParam(search.error)}
        message={readSearchParam(search.message)}
        authAvailable={hasSupabasePublicEnv()}
      />
    </AuthCard>
  );
}
