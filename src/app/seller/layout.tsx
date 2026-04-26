import Link from "next/link";
import { Container } from "@/components/ui/container";
import { getAuthSessionState } from "@/lib/auth/session";
import { SellerNav } from "@/features/seller/components/seller-nav";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSessionState();
  const showSellerChrome = session.profile?.role === "seller";

  return (
    <div className="py-12 md:py-16">
      <Container>
        {showSellerChrome ? (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <SellerNav />
            <Link
              href="/account"
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-border bg-panel px-4 text-sm font-medium text-foreground"
            >
              Back to account
            </Link>
          </div>
        ) : null}

        {children}
      </Container>
    </div>
  );
}
