"use client";

import { useFormStatus } from "react-dom";

type CartSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  className: string;
};

export function CartSubmitButton({
  idleLabel,
  pendingLabel,
  className,
}: CartSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
