import { AuthMessage } from "@/features/auth/components/auth-message";

type AuthFormProps = {
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  includeFullName?: boolean;
  nextPath?: string;
  error?: string | null;
  message?: string | null;
  authAvailable: boolean;
};

export function AuthForm({
  action,
  submitLabel,
  includeFullName = false,
  nextPath,
  error,
  message,
  authAvailable,
}: AuthFormProps) {
  return (
    <form action={action} className="space-y-4">
      {!authAvailable ? (
        <AuthMessage
          tone="info"
          message="Supabase auth is not configured in this environment yet. Add the project credentials to enable sign-in and sign-up."
        />
      ) : null}

      {error ? <AuthMessage tone="error" message={error} /> : null}
      {message ? <AuthMessage tone="success" message={message} /> : null}

      {includeFullName ? (
        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground">Full name</span>
          <input
            type="text"
            name="fullName"
            className="border-border bg-white/80 focus:border-brand w-full rounded-2xl border px-4 py-3 outline-none"
            placeholder="Jane Doe"
          />
        </label>
      ) : null}

      <label className="block space-y-2">
        <span className="text-sm font-medium text-foreground">Email</span>
        <input
          type="email"
          name="email"
          className="border-border bg-white/80 focus:border-brand w-full rounded-2xl border px-4 py-3 outline-none"
          placeholder="jane@example.com"
          required
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-foreground">Password</span>
        <input
          type="password"
          name="password"
          className="border-border bg-white/80 focus:border-brand w-full rounded-2xl border px-4 py-3 outline-none"
          placeholder="••••••••"
          minLength={8}
          required
        />
      </label>

      <input type="hidden" name="next" value={nextPath ?? "/account"} />

      <button
        type="submit"
        className="bg-brand w-full rounded-full px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!authAvailable}
      >
        {submitLabel}
      </button>
    </form>
  );
}
