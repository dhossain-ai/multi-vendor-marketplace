import Link from "next/link";

type AccessPlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  statusLabel?: string | null;
  nextStep?: string | null;
};

export function AccessPlaceholder({
  eyebrow,
  title,
  description,
  statusLabel,
  nextStep,
}: AccessPlaceholderProps) {
  return (
    <div className="border-border bg-panel rounded-[2rem] border p-8 shadow-[var(--shadow-panel)]">
      <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="text-ink-muted mt-4 text-sm leading-7">{description}</p>

      {statusLabel ? (
        <div className="bg-panel-muted mt-6 rounded-2xl px-4 py-3 text-sm text-foreground">
          Current status: <span className="font-medium capitalize">{statusLabel}</span>
        </div>
      ) : null}

      {nextStep ? (
        <p className="text-ink-muted mt-4 text-sm leading-7">{nextStep}</p>
      ) : null}

      <Link href="/account" className="text-brand mt-6 inline-flex text-sm font-medium">
        Back to account
      </Link>
    </div>
  );
}
