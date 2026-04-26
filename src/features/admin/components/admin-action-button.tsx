"use client";

import { useFormStatus } from "react-dom";
import type { ButtonHTMLAttributes } from "react";

type AdminActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
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
  ...props
}: AdminActionButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      type={props.type ?? "submit"}
      disabled={pending || props.disabled}
      className={`inline-flex min-h-9 items-center justify-center rounded-full px-4 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60 ${toneClasses[tone]} ${props.className ?? ""}`}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
