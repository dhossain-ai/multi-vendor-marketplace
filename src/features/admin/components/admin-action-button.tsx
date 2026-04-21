"use client";

import { useFormStatus } from "react-dom";

type AdminActionButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  tone?: "primary" | "secondary" | "danger";
};

const toneClasses: Record<NonNullable<AdminActionButtonProps["tone"]>, string> = {
  primary: "bg-brand text-white",
  secondary: "border border-border bg-panel-muted text-foreground",
  danger: "border border-red-200 bg-red-50 text-red-700",
};

export function AdminActionButton({
  idleLabel,
  pendingLabel,
  tone = "secondary",
}: AdminActionButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex min-h-9 items-center justify-center rounded-full px-4 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60 ${toneClasses[tone]}`}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
