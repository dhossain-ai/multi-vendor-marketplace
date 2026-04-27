import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { AccountProfileForm } from "@/features/account/components/account-profile-form";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { readSearchParam } from "@/lib/auth/navigation";
import { requireAuthenticatedUser } from "@/lib/auth/guards";

type AccountProfilePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Account profile",
  description: "Review and update your marketplace profile.",
};

export default async function AccountProfilePage({
  searchParams,
}: AccountProfilePageProps) {
  const search = await searchParams;
  const session = await requireAuthenticatedUser("/account/profile");

  return (
    <div className="py-12 md:py-16">
      <Container>
        {session.profile ? (
          <AccountProfileForm
            profile={session.profile}
            notice={readSearchParam(search.notice)}
            error={readSearchParam(search.error)}
          />
        ) : (
          <AuthMessage
            tone="error"
            message="We could not load your account profile. Please try again shortly."
          />
        )}
      </Container>
    </div>
  );
}
