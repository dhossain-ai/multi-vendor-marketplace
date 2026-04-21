type AdminStatusBadgeProps = {
  label: string;
};

const statusClasses: Record<string, string> = {
  approved: "bg-emerald-100 text-emerald-800",
  active: "bg-emerald-100 text-emerald-800",
  paid: "bg-emerald-100 text-emerald-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  completed: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  draft: "bg-amber-100 text-amber-800",
  unpaid: "bg-amber-100 text-amber-800",
  processing: "bg-blue-100 text-blue-800",
  archived: "bg-slate-100 text-slate-700",
  inactive: "bg-slate-100 text-slate-700",
  rejected: "bg-red-100 text-red-800",
  suspended: "bg-red-100 text-red-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-slate-200 text-slate-800",
  partially_refunded: "bg-slate-200 text-slate-800",
};

export function AdminStatusBadge({ label }: AdminStatusBadgeProps) {
  const key = label.toLowerCase();

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClasses[key] ?? "bg-slate-100 text-slate-700"}`}
    >
      {label.replace(/_/g, " ")}
    </span>
  );
}
