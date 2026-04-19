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
  return (
    <div
      aria-label={`${title} preview`}
      className={cn(
        "from-brand-soft via-brand-soft/70 to-brand/10 relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br",
        className,
      )}
      style={
        imageUrl
          ? {
              backgroundImage: `linear-gradient(135deg, rgba(241, 209, 175, 0.65), rgba(157, 90, 27, 0.08)), url(${imageUrl})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }
          : undefined
      }
    >
      <div className="bg-panel/50 absolute inset-0" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />
      <div className="relative flex h-full items-end p-5">
        <div className="text-foreground rounded-full bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.14em] uppercase">
          Product Preview
        </div>
      </div>
    </div>
  );
}
