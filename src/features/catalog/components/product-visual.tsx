import { cn } from "@/lib/utils/cn";

type ProductVisualProps = {
  title: string;
  imageUrl?: string | null;
  className?: string;
};

export function ProductVisual({
  title,
  imageUrl,
  className,
}: ProductVisualProps) {
  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return (
    <div
      aria-label={`${title} preview`}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-sky-100 via-white to-emerald-100",
        className,
      )}
      style={
        imageUrl
          ? {
              backgroundImage: `linear-gradient(135deg, rgba(255, 255, 255, 0.18), rgba(15, 23, 42, 0.08)), url(${imageUrl})`,
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
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-white/75 bg-white/78 text-3xl font-semibold text-foreground shadow-sm">
            {initials || "NM"}
          </div>
        </div>
      ) : null}
    </div>
  );
}
