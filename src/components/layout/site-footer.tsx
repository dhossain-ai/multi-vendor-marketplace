import { Container } from "@/components/ui/container";

export function SiteFooter() {
  return (
    <footer className="border-border/70 border-t bg-white/60 py-6">
      <Container className="text-ink-muted flex flex-col gap-2 text-sm md:flex-row md:items-center md:justify-between">
        <p>Public catalog foundation for a modular multi-vendor marketplace.</p>
        <p>
          Auth, cart, checkout, and dashboard flows remain intentionally
          deferred.
        </p>
      </Container>
    </footer>
  );
}
