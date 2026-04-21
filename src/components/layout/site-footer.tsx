import { Container } from "@/components/ui/container";

export function SiteFooter() {
  return (
    <footer className="border-border/70 border-t bg-white/60 py-6">
      <Container className="text-ink-muted flex flex-col gap-2 text-sm md:flex-row md:items-center md:justify-between">
        <p>Northstar Market brings shopper, seller, and admin experiences into one marketplace.</p>
        <p>Shop confidently, manage your store clearly, and keep platform operations separate.</p>
      </Container>
    </footer>
  );
}
