import { cn } from "@/lib/utils/cn";

type StatusTone = "success" | "info" | "warning" | "danger" | "neutral";

type StatusBadgeProps = {
  label: string;
  tone?: StatusTone;
  className?: string;
};

const toneClasses: Record<StatusTone, string> = {
  success: "bg-emerald-100 text-emerald-800",
  info: "bg-blue-100 text-blue-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
  neutral: "bg-slate-100 text-slate-700",
};

const statusToneMap: Record<string, StatusTone> = {
  active: "success",
  approved: "success",
  confirmed: "success",
  completed: "success",
  delivered: "success",
  paid: "success",
  ready: "success",
  processing: "info",
  shipped: "info",
  payment_processing: "info",
  pending: "warning",
  pending_payment: "warning",
  draft: "warning",
  unpaid: "warning",
  unfulfilled: "warning",
  failed: "danger",
  payment_failed: "danger",
  cancelled: "danger",
  rejected: "danger",
  suspended: "danger",
  archived: "neutral",
  inactive: "neutral",
  refunded: "neutral",
  partially_refunded: "neutral",
};

export const getStatusTone = (status: string): StatusTone =>
  statusToneMap[status.toLowerCase().replace(/\s+/g, "_")] ?? "neutral";

export function StatusBadge({ label, tone, className }: StatusBadgeProps) {
  const resolvedTone = tone ?? getStatusTone(label);

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        toneClasses[resolvedTone],
        className,
      )}
    >
      {label.replace(/_/g, " ")}
    </span>
  );
}
