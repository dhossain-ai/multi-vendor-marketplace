import { Container } from "@/components/ui/container";

export function SiteFooter() {
  return (
    <footer className="border-border/70 border-t bg-white/60 py-8">
      <Container className="text-ink-muted flex flex-col gap-3 text-sm md:flex-row md:items-center md:justify-between">
        <p className="font-medium text-foreground">Northstar Market</p>
        <p className="max-w-2xl md:text-right">
          Shop confidently, manage stores clearly, and keep marketplace operations
          separated by role.
        </p>
      </Container>
    </footer>
  );
}
