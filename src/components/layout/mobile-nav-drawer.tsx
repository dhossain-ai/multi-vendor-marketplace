"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export type MobileNavItem = {
  href: string;
  label: string;
  tone?: "primary" | "secondary";
};

type MobileNavDrawerProps = {
  links: MobileNavItem[];
};

export function MobileNavDrawer({ links }: MobileNavDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();

  return (
    <div className="relative xl:hidden">
      <button
        type="button"
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-border bg-panel text-foreground shadow-sm transition hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <span className="sr-only">
          {isOpen ? "Close navigation menu" : "Open navigation menu"}
        </span>
        <span aria-hidden="true" className="flex h-4 w-5 flex-col justify-between">
          <span
            className={cn(
              "h-0.5 w-full rounded-full bg-current transition",
              isOpen && "translate-y-[7px] rotate-45",
            )}
          />
          <span
            className={cn(
              "h-0.5 w-full rounded-full bg-current transition",
              isOpen && "opacity-0",
            )}
          />
          <span
            className={cn(
              "h-0.5 w-full rounded-full bg-current transition",
              isOpen && "-translate-y-[7px] -rotate-45",
            )}
          />
        </span>
      </button>

      {isOpen ? (
        <nav
          id={menuId}
          aria-label="Mobile navigation"
          className="absolute right-0 top-12 z-30 w-[min(20rem,calc(100vw-3rem))] rounded-[1.5rem] border border-border bg-white p-3 shadow-[var(--shadow-panel)]"
        >
          <div className="grid gap-2">
            {links.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                  link.tone === "primary"
                    ? "bg-brand text-white hover:bg-foreground"
                    : "border border-border bg-panel-muted text-foreground hover:border-foreground/25 hover:bg-panel",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
