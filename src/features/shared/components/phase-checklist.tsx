const completed = [
  "Next.js App Router with TypeScript and Tailwind CSS",
  "ESLint and Prettier scripts configured",
  "Scalable src-based folder boundaries",
  "Shared app shell and homepage placeholder",
  "Environment example and Supabase scaffolding",
];

export function PhaseChecklist() {
  return (
    <div className="border-border bg-panel rounded-[2rem] border p-6 shadow-[var(--shadow-panel)]">
      <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
        Phase 1 Deliverables
      </p>
      <ul className="mt-5 space-y-3">
        {completed.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="bg-brand mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white">
              OK
            </span>
            <span className="text-foreground text-sm leading-6">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
