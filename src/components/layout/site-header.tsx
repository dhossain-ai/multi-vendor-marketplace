import Link from "next/link";
import { Container } from "@/components/ui/container";
import { AuthNav } from "@/features/auth/components/auth-nav";
import { CartNav } from "@/features/cart/components/cart-nav";
import { siteConfig } from "@/lib/config/site";

export function SiteHeader() {
  return (
    <header className="border-border/80 sticky top-0 z-20 border-b bg-white/70 backdrop-blur-xl">
      <Container className="flex min-h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="bg-brand inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white">
            MP
          </span>
          <div>
            <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
              Marketplace
            </p>
            <p className="text-ink-muted text-sm">{siteConfig.tagline}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <Link
            href="/"
            className="bg-brand rounded-full px-4 py-2 text-sm font-medium text-white"
          >
            Catalog
          </Link>
          <CartNav />
          <Link
            href="/checkout"
            className="border-border bg-panel text-foreground rounded-full border px-4 py-2 text-sm font-medium"
          >
            Checkout
          </Link>
          <AuthNav />
        </nav>
      </Container>
    </header>
  );
}
