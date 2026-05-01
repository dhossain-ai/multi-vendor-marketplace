import Link from "next/link";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/config/site";

const footerSections = [
  {
    title: "Shop",
    links: [
      { href: "/products", label: "Browse products" },
      { href: "/#categories", label: "Browse departments" },
      { href: "/#new-arrivals", label: "New arrivals" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/account", label: "Account home" },
      { href: "/orders", label: "Orders" },
      { href: "/cart", label: "Cart" },
    ],
  },
  {
    title: "Sellers",
    links: [
      { href: "/sell", label: "Start selling" },
      { href: "/seller/register", label: "Seller application" },
      { href: "/seller", label: "Seller dashboard" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-foreground text-white">
      <Container className="py-10 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)]">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
                NM
              </span>
              <div>
                <p className="text-sm font-semibold uppercase">{siteConfig.name}</p>
                <p className="text-sm text-white/68">{siteConfig.tagline}</p>
              </div>
            </Link>
            <p className="max-w-xl text-sm leading-7 text-white/72">
              A multi-vendor marketplace for useful products from independent
              sellers, with secure checkout and account-based order history.
            </p>
            <p className="text-sm font-medium text-white/82">
              Secure checkout. Trusted sellers. Tracked orders.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {footerSections.map((section) => (
              <nav key={section.title} className="space-y-3" aria-label={section.title}>
                <p className="text-sm font-semibold uppercase text-white/58">
                  {section.title}
                </p>
                <ul className="space-y-2 text-sm text-white/78">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="hover:text-white hover:underline">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/12 pt-5 text-sm text-white/58 md:flex-row md:items-center md:justify-between">
          <p>(c) 2026 Northstar Market. Independent shops, one clear checkout.</p>
          <p>Products are shown from active departments and trusted sellers.</p>
        </div>
      </Container>
    </footer>
  );
}
