import type { PropsWithChildren } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";

type AuthCardProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
  footerLabel: string;
  footerHref: string;
  footerCta: string;
}>;

export function AuthCard({
  eyebrow,
  title,
  description,
  footerLabel,
  footerHref,
  footerCta,
  children,
}: AuthCardProps) {
  return (
    <div className="py-16 md:py-24">
      <Container className="mx-auto max-w-xl">
        <div className="border-border bg-panel rounded-[2rem] border p-8 shadow-[var(--shadow-panel)]">
          <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-ink-muted mt-3 text-sm leading-7">{description}</p>

          <div className="mt-8">{children}</div>

          <p className="text-ink-muted mt-8 text-sm">
            {footerLabel}{" "}
            <Link href={footerHref} className="text-brand font-medium">
              {footerCta}
            </Link>
          </p>
        </div>
      </Container>
    </div>
  );
}
