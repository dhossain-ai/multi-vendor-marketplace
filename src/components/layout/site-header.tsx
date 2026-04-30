import Link from "next/link";
import { Container } from "@/components/ui/container";
import { CartNav } from "@/features/cart/components/cart-nav";
import { getAuthSessionState } from "@/lib/auth/session";
import { siteConfig } from "@/lib/config/site";

function HeaderLink({
  href,
  label,
  tone = "secondary",
}: {
  href: string;
  label: string;
  tone?: "secondary" | "primary";
}) {
  return (
    <Link
      href={href}
      className={
        tone === "primary"
          ? "inline-flex min-h-10 items-center justify-center rounded-full bg-brand px-4 text-sm font-semibold text-white"
          : "inline-flex min-h-10 items-center justify-center rounded-full border border-border bg-panel px-4 text-sm font-medium text-foreground transition hover:border-foreground/25"
      }
    >
      {label}
    </Link>
  );
}

export async function SiteHeader() {
  const session = await getAuthSessionState();
  const isSignedIn = Boolean(session.user);
  const isApprovedSeller =
    session.profile?.role === "seller" && session.sellerProfile?.status === "approved";
  const showSellerEntry = Boolean(session.user) && session.profile?.role !== "admin";
  const sellerEntryHref = isApprovedSeller ? "/seller" : "/seller/register";
  const sellerEntryLabel = isApprovedSeller
    ? "Seller Dashboard"
    : session.sellerProfile
      ? "Seller Application"
      : "Sell";
  const isAdmin = session.profile?.role === "admin";

  return (
    <header className="border-border/80 sticky top-0 z-20 border-b bg-white/70 backdrop-blur-xl">
      <Container className="py-3 md:py-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="bg-brand inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white">
              NM
            </span>
            <div className="min-w-0">
              <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
                {siteConfig.name}
              </p>
              <p className="text-ink-muted text-sm">{siteConfig.tagline}</p>
            </div>
          </Link>

          <div className="flex flex-col gap-3 xl:items-end">
            <nav className="flex flex-wrap items-center gap-2">
              <HeaderLink href="/products" label="Browse products" tone="primary" />
              <HeaderLink href="/#categories" label="Categories" />
              <HeaderLink href="/#featured" label="Featured" />
            </nav>

            <nav className="flex flex-wrap items-center gap-2">
              {isSignedIn ? (
                <>
                  <CartNav />
                  <HeaderLink href="/orders" label="Orders" />
                  <HeaderLink href="/account" label="Account" />
                  {showSellerEntry ? (
                    <HeaderLink href={sellerEntryHref} label={sellerEntryLabel} />
                  ) : null}
                  {isAdmin ? <HeaderLink href="/admin" label="Admin Dashboard" /> : null}
                </>
              ) : (
                <>
                  <HeaderLink href="/sign-in" label="Sign in" />
                  <HeaderLink href="/sign-up" label="Sign up" tone="primary" />
                </>
              )}
            </nav>
          </div>
        </div>
      </Container>
    </header>
  );
}
