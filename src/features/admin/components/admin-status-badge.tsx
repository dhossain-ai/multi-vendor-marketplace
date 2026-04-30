import { StatusBadge } from "@/components/ui/status-badge";

type AdminStatusBadgeProps = {
  label: string;
};

export function AdminStatusBadge({ label }: AdminStatusBadgeProps) {
  return <StatusBadge label={label} />;
}
