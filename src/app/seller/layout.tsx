import Link from "next/link";
import { Container } from "@/components/ui/container";
import { requireSellerRole } from "@/lib/auth/guards";
import { SellerStatusGate } from "@/features/seller/components/seller-status-gate";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSellerRole("/seller");
  const sellerStatus = session.sellerProfile?.status ?? null;

  return (
    <div className="py-12 md:py-16">
      <Container>
        <SellerStatusGate status={sellerStatus}>
          <nav className="mb-8 flex flex-wrap items-center gap-1 rounded-full border border-border bg-panel-muted p-1 shadow-sm">
            <Link
              href="/seller"
              className="rounded-full px-4 py-2 text-sm font-medium text-foreground transition hover:bg-panel"
            >
              Dashboard
            </Link>
            <Link
              href="/seller/products"
              className="rounded-full px-4 py-2 text-sm font-medium text-foreground transition hover:bg-panel"
            >
              Products
            </Link>
            <Link
              href="/seller/orders"
              className="rounded-full px-4 py-2 text-sm font-medium text-foreground transition hover:bg-panel"
            >
              Orders
            </Link>
          </nav>

          {children}
        </SellerStatusGate>
      </Container>
    </div>
  );
}
