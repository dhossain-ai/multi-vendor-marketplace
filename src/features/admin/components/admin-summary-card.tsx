type AdminSummaryCardProps = {
  label: string;
  value: string | number;
  sublabel?: string;
};

export function AdminSummaryCard({
  label,
  value,
  sublabel,
}: AdminSummaryCardProps) {
  return (
    <div className="rounded-[1.75rem] border border-border bg-panel p-5 shadow-[var(--shadow-panel)]">
      <p className="text-sm font-medium text-ink-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      {sublabel ? <p className="mt-1 text-xs text-ink-muted">{sublabel}</p> : null}
    </div>
  );
}
