import Link from "next/link";
import { Container } from "@/components/ui/container";
import { requireSellerRole } from "@/lib/auth/guards";
import { SellerNav } from "@/features/seller/components/seller-nav";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSellerRole("/seller");

  return (
    <div className="py-12 md:py-16">
      <Container>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <SellerNav />
          <Link
            href="/account"
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-border bg-panel px-4 text-sm font-medium text-foreground"
          >
            Back to account
          </Link>
        </div>

        {children}
      </Container>
    </div>
  );
}
