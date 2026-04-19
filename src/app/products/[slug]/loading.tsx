import { Container } from "@/components/ui/container";

export default function ProductDetailLoading() {
  return (
    <div className="py-14 md:py-20">
      <Container className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="from-brand-soft/50 to-brand/10 h-[24rem] animate-pulse rounded-[2rem] bg-gradient-to-br md:h-[32rem]" />
        <div className="border-border bg-panel rounded-[2rem] border p-7 shadow-[var(--shadow-panel)]">
          <div className="space-y-4">
            <div className="bg-brand-soft h-4 w-28 animate-pulse rounded-full" />
            <div className="h-10 w-3/4 animate-pulse rounded-2xl bg-white/70" />
            <div className="h-24 animate-pulse rounded-3xl bg-white/70" />
            <div className="h-40 animate-pulse rounded-3xl bg-white/70" />
          </div>
        </div>
      </Container>
    </div>
  );
}
