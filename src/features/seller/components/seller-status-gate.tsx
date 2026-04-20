import Link from "next/link";
import type { SellerStatus } from "@/types/auth";

type SellerStatusGateProps = {
  status: SellerStatus | null | undefined;
  children: React.ReactNode;
};

const statusMessages: Record<string, { title: string; description: string }> = {
  pending: {
    title: "Seller application pending",
    description:
      "Your seller application is being reviewed. You will gain access to the seller dashboard once your application is approved by the platform team.",
  },
  rejected: {
    title: "Seller application rejected",
    description:
      "Your seller application was not approved. If you believe this was an error, please contact support for further assistance.",
  },
  suspended: {
    title: "Seller account suspended",
    description:
      "Your seller account has been suspended. You cannot access seller features at this time. Please contact support if you need assistance.",
  },
};

/**
 * Renders children only if the seller is approved.
 * Shows a status message for pending/rejected/suspended sellers.
 * Shows a missing-profile message if no seller profile exists.
 */
export function SellerStatusGate({ status, children }: SellerStatusGateProps) {
  if (status === "approved") {
    return <>{children}</>;
  }

  if (!status) {
    return (
      <div className="border-border bg-panel rounded-[2rem] border p-8 shadow-[var(--shadow-panel)]">
        <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
          Seller access
        </p>
        <h2 className="text-foreground mt-3 text-3xl font-semibold tracking-tight">
          No seller profile found
        </h2>
        <p className="text-ink-muted mt-4 text-sm leading-7">
          You need a seller profile to access dashboard features. Contact
          platform support or complete seller registration first.
        </p>
        <Link
          href="/account"
          className="text-brand mt-6 inline-flex text-sm font-medium"
        >
          Back to account
        </Link>
      </div>
    );
  }

  const info = statusMessages[status];

  return (
    <div className="border-border bg-panel rounded-[2rem] border p-8 shadow-[var(--shadow-panel)]">
      <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
        Seller access
      </p>
      <h2 className="text-foreground mt-3 text-3xl font-semibold tracking-tight">
        {info?.title ?? "Seller access unavailable"}
      </h2>
      <p className="text-ink-muted mt-4 text-sm leading-7">
        {info?.description ?? "Your seller account is not currently in an active state."}
      </p>
      <div className="bg-panel-muted mt-6 rounded-2xl px-4 py-3 text-sm text-foreground">
        Current status:{" "}
        <span className="font-medium capitalize">{status}</span>
      </div>
      <Link
        href="/account"
        className="text-brand mt-6 inline-flex text-sm font-medium"
      >
        Back to account
      </Link>
    </div>
  );
}
