import { Container } from "@/components/ui/container";
import { readSearchParam } from "@/lib/auth/navigation";
import { requireAuthenticatedUser } from "@/lib/auth/guards";
import { AccountSummary } from "@/features/auth/components/account-summary";

type AccountPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const search = await searchParams;
  const session = await requireAuthenticatedUser("/account");

  if (!session.profile) {
    return (
      <div className="py-16">
        <Container className="border-border bg-panel rounded-[2rem] border p-8 shadow-[var(--shadow-panel)]">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            We could not finish setting up your account
          </h1>
          <p className="text-ink-muted mt-4 text-sm leading-7">
            Your sign-in worked, but the marketplace profile record could not be
            loaded yet. Please try again shortly.
          </p>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-16">
      <Container>
        <AccountSummary
          profile={session.profile}
          sellerProfile={session.sellerProfile}
          notice={readSearchParam(search.notice)}
        />
      </Container>
    </div>
  );
}
