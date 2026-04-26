"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SellerStatus } from "@/types/auth";

type SellerNavProps = {
  status?: SellerStatus | null;
};

const getLinks = (status?: SellerStatus | null) => {
  const baseLinks = [
    { href: "/seller", label: "Overview" },
  ];

  if (status === "approved") {
    baseLinks.push({ href: "/seller/products", label: "Products" });
    baseLinks.push({ href: "/seller/orders", label: "Orders" });
  }

  baseLinks.push({ href: "/seller/settings", label: "Settings" });

  if (status === "rejected") {
    baseLinks.push({ href: "/seller/register", label: "Resubmit Application" });
  }

  return baseLinks;
};

const isActive = (pathname: string, href: string) =>
  href === "/seller" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

export function SellerNav({ status }: SellerNavProps) {
  const pathname = usePathname();
  const links = getLinks(status);

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
