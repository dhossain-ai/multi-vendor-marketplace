import Link from "next/link";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/config/site";

const navItems = ["Catalog", "Auth", "Cart", "Checkout"];

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
          {navItems.map((item) => (
            <span
              key={item}
              className="border-border bg-panel text-ink-muted rounded-full border px-4 py-2 text-sm"
            >
              {item}
            </span>
          ))}
        </nav>
      </Container>
    </header>
  );
}
