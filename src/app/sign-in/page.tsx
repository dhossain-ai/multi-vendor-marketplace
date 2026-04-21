import { redirect } from "next/navigation";
import { hasSupabasePublicEnv } from "@/lib/config/env";
import { signInAction } from "@/lib/auth/actions";
import { readSearchParam, sanitizeRedirectPath } from "@/lib/auth/navigation";
import { getAuthSessionState } from "@/lib/auth/session";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthForm } from "@/features/auth/components/auth-form";

type SignInPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const search = await searchParams;
  const session = await getAuthSessionState();

  if (session.user) {
    redirect("/account");
  }

  return (
    <AuthCard
      eyebrow="Sign in"
      title="Welcome back"
      description="Use your email and password to continue shopping, reviewing orders, or opening your role-specific dashboard."
      footerLabel="Need an account?"
      footerHref="/sign-up"
      footerCta="Create one"
    >
      <AuthForm
        action={signInAction}
        submitLabel="Sign in"
        nextPath={sanitizeRedirectPath(readSearchParam(search.next))}
        error={readSearchParam(search.error)}
        message={readSearchParam(search.message)}
        authAvailable={hasSupabasePublicEnv()}
      />
    </AuthCard>
  );
}
