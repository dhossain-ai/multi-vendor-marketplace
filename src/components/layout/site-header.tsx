import Link from "next/link";
import { Container } from "@/components/ui/container";
import {
  MobileNavDrawer,
  type MobileNavItem,
} from "@/components/layout/mobile-nav-drawer";
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
          ? "inline-flex min-h-10 items-center justify-center rounded-full bg-brand px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          : "inline-flex min-h-10 items-center justify-center rounded-full border border-border bg-white/75 px-4 text-sm font-medium text-foreground transition hover:border-foreground/25 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      }
    >
      {label}
    </Link>
  );
}

function HeaderSearch() {
  return (
    <form
      action="/products"
      method="GET"
      className="flex w-full min-w-0 max-w-full items-center overflow-hidden rounded-full border border-border bg-white p-1 shadow-sm"
    >
      <label htmlFor="site-product-search" className="sr-only">
        Search products
      </label>
      <input
        id="site-product-search"
        name="q"
        type="search"
        placeholder="Search products"
        className="h-10 min-w-0 flex-1 rounded-full bg-transparent px-4 text-sm text-foreground placeholder:text-ink-muted focus:outline-none"
      />
      <button
        type="submit"
        className="inline-flex h-10 w-14 shrink-0 items-center justify-center rounded-full bg-foreground px-3 text-sm font-semibold text-white transition hover:bg-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:w-auto sm:px-4"
      >
        <span className="sm:hidden">Go</span>
        <span className="hidden sm:inline">Search</span>
      </button>
    </form>
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
  const mobileLinks: MobileNavItem[] = [
    { href: "/products", label: "Browse products", tone: "primary" },
    { href: "/#categories", label: "Categories" },
    { href: "/#featured", label: "Featured picks" },
    { href: "/#new-arrivals", label: "New arrivals" },
    ...(isSignedIn
      ? [
          { href: "/orders", label: "Orders" },
          { href: "/account", label: "Account" },
        ]
      : [
          { href: "/sign-in", label: "Sign in" },
          { href: "/sign-up", label: "Sign up", tone: "primary" as const },
        ]),
    ...(showSellerEntry
      ? [{ href: sellerEntryHref, label: sellerEntryLabel }]
      : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin dashboard" }] : []),
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-white/88 backdrop-blur-xl">
      <div className="bg-foreground text-white">
        <Container className="flex min-h-9 flex-wrap items-center justify-center gap-x-4 gap-y-1 py-2 text-center text-xs font-medium sm:justify-between">
          <p>Independent sellers. Secure checkout. Tracked orders.</p>
          <Link href="/sell" className="hidden underline-offset-4 hover:underline sm:inline">
            Start selling on Northstar
          </Link>
        </Container>
      </div>

      <Container className="py-3 md:py-4">
        <div className="grid gap-3 xl:grid-cols-[minmax(16rem,0.72fr)_minmax(20rem,1.2fr)_auto] xl:items-center">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white shadow-sm">
                NM
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold uppercase text-brand">
                  {siteConfig.name}
                </p>
                <p className="hidden truncate text-sm text-ink-muted sm:block">
                  {siteConfig.tagline}
                </p>
              </div>
            </Link>
            <div className="flex shrink-0 items-center gap-2 xl:hidden">
              <CartNav compact />
              <MobileNavDrawer links={mobileLinks} />
            </div>
          </div>

          <HeaderSearch />

          <nav className="hidden flex-wrap items-center justify-end gap-2 xl:flex">
            <HeaderLink href="/products" label="Browse products" tone="primary" />
            <HeaderLink href="/#categories" label="Departments" />
            <HeaderLink href="/#featured" label="Featured picks" />
          </nav>
        </div>

        <div className="mt-3 hidden xl:flex xl:items-center xl:justify-end">
          <nav className="flex w-full min-w-0 flex-wrap items-center justify-end gap-2">
            <div className="hidden xl:block">
              <CartNav />
            </div>
            {isSignedIn ? (
              <>
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
      </Container>
    </header>
  );
}
