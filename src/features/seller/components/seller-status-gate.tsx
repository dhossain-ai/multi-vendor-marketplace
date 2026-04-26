import Link from "next/link";
import { getSellerStatusDetails, getSellerStatusLabel } from "@/features/seller/lib/seller-status";
import type { SellerStatus } from "@/types/auth";

type SellerStatusGateProps = {
  status: SellerStatus | null | undefined;
  ctaHref?: string;
  ctaLabel?: string;
  children?: React.ReactNode;
};

/**
 * Renders children only if the seller is approved.
 * Shows a status message for pending/rejected/suspended sellers.
 * Shows a missing-profile message if no seller profile exists.
 */
export function SellerStatusGate({
  status,
  ctaHref = "/seller/settings",
  ctaLabel = "Open store settings",
  children,
}: SellerStatusGateProps) {
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
          You need a store profile before you can manage listings or orders. Set
          up your seller application first, then come back once it is submitted.
        </p>
        <Link
          href="/seller/register"
          className="text-brand mt-6 inline-flex text-sm font-medium"
        >
          Go to application
        </Link>
      </div>
    );
  }

  const info = getSellerStatusDetails(status);

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
      <p className="text-ink-muted mt-3 text-sm leading-7">
        {info?.nextStep ??
          "Update your store details and wait for marketplace approval before using seller tools."}
      </p>
      <div className="bg-panel-muted mt-6 rounded-2xl px-4 py-3 text-sm text-foreground">
        Current status:{" "}
        <span className="font-medium">{getSellerStatusLabel(status)}</span>
      </div>
      <Link
        href={ctaHref}
        className="text-brand mt-6 inline-flex text-sm font-medium"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
