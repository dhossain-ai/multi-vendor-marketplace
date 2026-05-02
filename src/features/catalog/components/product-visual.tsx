import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ProductVisualProps = {
  title: string;
  imageUrl?: string | null;
  categoryName?: string | null;
  className?: string;
  children?: ReactNode;
};

export function ProductVisual({
  title,
  imageUrl,
  categoryName,
  className,
  children,
}: ProductVisualProps) {
  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return (
    <div
      aria-label={`${title} product image`}
      role="img"
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-sky-100 via-white to-emerald-100",
        className,
      )}
      style={
        imageUrl
          ? {
              backgroundImage: `linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(15, 23, 42, 0.06)), url(${imageUrl})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }
          : undefined
      }
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.85),transparent_28%),radial-gradient(circle_at_85%_15%,rgba(56,189,248,0.22),transparent_30%),radial-gradient(circle_at_80%_85%,rgba(16,185,129,0.20),transparent_28%)]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/25 to-transparent" />
      {!imageUrl ? (
        <div className="relative flex h-full items-center justify-center p-6">
          <div className="absolute left-5 top-5 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold uppercase text-brand shadow-sm">
            {categoryName ?? "Marketplace pick"}
          </div>
          <div className="absolute right-6 top-14 h-16 w-16 rounded-2xl border border-white/65 bg-white/35 shadow-sm" />
          <div className="absolute bottom-7 left-7 h-12 w-28 rounded-full border border-white/60 bg-white/30" />
          <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-white/80 bg-white/82 text-3xl font-semibold text-foreground shadow-sm">
            {initials || "NM"}
          </div>
        </div>
      ) : null}
      {children ? <div className="absolute inset-0">{children}</div> : null}
    </div>
  );
}
