"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/sellers", label: "Sellers" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/orders", label: "Orders" },
];

const isActive = (pathname: string, href: string) =>
  href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-border bg-panel-muted p-1 shadow-sm md:flex-wrap">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
            isActive(pathname, link.href)
              ? "bg-panel text-foreground shadow-sm"
              : "text-foreground hover:bg-panel"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
