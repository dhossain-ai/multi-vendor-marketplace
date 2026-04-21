"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/seller", label: "Overview" },
  { href: "/seller/products", label: "Products" },
  { href: "/seller/orders", label: "Orders" },
  { href: "/seller/settings", label: "Settings" },
];

const isActive = (pathname: string, href: string) =>
  href === "/seller" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

export function SellerNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-1 rounded-full border border-border bg-panel-muted p-1 shadow-sm">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            isActive(pathname, link.href)
              ? "bg-panel text-foreground"
              : "text-foreground hover:bg-panel"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
