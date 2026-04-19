type AuthMessageProps = {
  tone: "error" | "success" | "info";
  message: string;
};

const toneClasses: Record<AuthMessageProps["tone"], string> = {
  error: "border-red-200 bg-red-50 text-red-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  info: "border-amber-200 bg-amber-50 text-amber-700",
};

export function AuthMessage({ tone, message }: AuthMessageProps) {
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${toneClasses[tone]}`}>
      {message}
    </div>
  );
}
