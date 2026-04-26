import { AuthMessage } from "@/features/auth/components/auth-message";
import { AdminActionButton } from "@/features/admin/components/admin-action-button";
import { AdminStatusBadge } from "@/features/admin/components/admin-status-badge";
import { updateSellerStatusAction } from "@/features/admin/lib/admin-actions";
import type { AdminSellerDetail, AdminSellerStatus } from "@/features/admin/types";
import Link from "next/link";

type AdminSellerDetailViewProps = {
  seller: AdminSellerDetail;
  notice?: string | null;
  error?: string | null;
};

const sellerActions: Record<AdminSellerStatus, Array<AdminSellerStatus>> = {
  pending: ["approved", "rejected", "suspended"],
  approved: ["suspended"],
  rejected: ["approved", "suspended"],
  suspended: ["approved", "rejected"],
};

const buttonTone = (status: AdminSellerStatus) =>
  status === "approved"
    ? "primary"
    : status === "suspended" || status === "rejected"
      ? "danger"
      : "secondary";

export function AdminSellerDetailView({
  seller,
  notice,
  error,
}: AdminSellerDetailViewProps) {
  const allowedActions = sellerActions[seller.status];

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="space-y-3">
        <Link 
          href="/admin/sellers"
          className="text-sm font-medium text-brand hover:underline"
        >
          &larr; Back to sellers
        </Link>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground mt-4">
          Seller Review
        </h1>
      </div>

      {error ? <AuthMessage tone="error" message={error} /> : null}
      {notice && !error ? <AuthMessage tone="success" message={notice} /> : null}

      <div className="rounded-[1.75rem] border border-border bg-panel p-6 shadow-[var(--shadow-panel)] space-y-8">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <AdminStatusBadge label={seller.status} />
              <h2 className="text-2xl font-semibold text-foreground">
                {seller.storeName}
              </h2>
            </div>
            <p className="text-sm text-ink-muted">
              {seller.slug ? `/${seller.slug}` : "No custom URL"}
            </p>
          </div>
          {seller.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={seller.logoUrl} 
              alt={`${seller.storeName} logo`}
              className="w-16 h-16 rounded-xl object-cover border border-border"
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider text-brand uppercase">Store Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="block text-ink-muted">Owner Name</span>
                <span className="font-medium text-foreground">{seller.ownerName || "Not provided"}</span>
              </div>
              <div>
                <span className="block text-ink-muted">Owner Account Email</span>
                <span className="font-medium text-foreground">{seller.ownerEmail || "Not provided"}</span>
              </div>
              <div>
                <span className="block text-ink-muted">Email Verified At</span>
                <span className="font-medium text-foreground">
                  {seller.emailConfirmedAt ? new Date(seller.emailConfirmedAt).toLocaleString() : "Not verified"}
                </span>
              </div>
              <div>
                <span className="block text-ink-muted">Bio</span>
                <p className="text-foreground leading-relaxed mt-1">
                  {seller.bio || "No bio provided."}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider text-brand uppercase">Contact & Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="block text-ink-muted">Support Email</span>
                <span className="font-medium text-foreground">{seller.supportEmail || "Not provided"}</span>
              </div>
              <div>
                <span className="block text-ink-muted">Business Email</span>
                <span className="font-medium text-foreground">{seller.businessEmail || "Not provided"}</span>
              </div>
              <div>
                <span className="block text-ink-muted">Phone</span>
                <span className="font-medium text-foreground">{seller.phone || "Not provided"}</span>
              </div>
              <div>
                <span className="block text-ink-muted">Country</span>
                <span className="font-medium text-foreground">{seller.countryCode || "Not provided"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6 space-y-4">
          <h3 className="text-sm font-semibold tracking-wider text-brand uppercase">Moderation Status</h3>
          <div className="space-y-3 text-sm">
            {seller.status === "rejected" && seller.rejectionReason && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <span className="block font-medium text-red-900 mb-1">Rejection Reason</span>
                <span className="text-red-800">{seller.rejectionReason}</span>
              </div>
            )}
            {seller.status === "suspended" && seller.suspensionReason && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <span className="block font-medium text-red-900 mb-1">Suspension Reason</span>
                <span className="text-red-800">{seller.suspensionReason}</span>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-ink-muted">
              <div>Created: {new Date(seller.createdAt).toLocaleString()}</div>
              {seller.resubmittedAt && <div>Resubmitted: {new Date(seller.resubmittedAt).toLocaleString()}</div>}
              {seller.approvedAt && <div>Approved: {new Date(seller.approvedAt).toLocaleString()}</div>}
              {seller.agreementAcceptedAt && <div>Terms Accepted: {new Date(seller.agreementAcceptedAt).toLocaleString()}</div>}
            </div>
          </div>

          <form action={updateSellerStatusAction} className="mt-6 rounded-2xl border border-border bg-panel-muted p-5 space-y-4">
            <input type="hidden" name="sellerId" value={seller.id} />
            <input type="hidden" name="returnTo" value={`/admin/sellers/${seller.id}`} />
            
            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm font-medium text-foreground">
                Action Reason <span className="text-ink-muted font-normal">(Required for reject/suspend)</span>
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={3}
                placeholder="Explain the moderation action to the seller..."
                className="w-full rounded-xl border border-border bg-panel px-4 py-3 text-sm text-foreground focus:border-brand focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {allowedActions.map((nextStatus) => (
                <AdminActionButton
                  key={nextStatus}
                  name="status"
                  value={nextStatus}
                  idleLabel={
                    nextStatus === "approved"
                      ? "Approve"
                      : nextStatus === "rejected"
                        ? "Reject"
                        : "Suspend"
                  }
                  pendingLabel="Saving..."
                  tone={buttonTone(nextStatus)}
                />
              ))}
            </div>
          </form>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Status History</h3>
        {seller.history.length === 0 ? (
          <p className="text-sm text-ink-muted">No status history recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {seller.history.map((event) => (
              <div key={event.id} className="rounded-xl border border-border bg-panel p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-foreground">
                      {event.previousStatus || "none"} &rarr; {event.newStatus}
                    </span>
                    <span className="text-xs text-ink-muted">
                      by {event.changedBy}
                    </span>
                  </div>
                  {event.reason && (
                    <p className="text-sm text-ink-muted italic">&quot;{event.reason}&quot;</p>
                  )}
                </div>
                <div className="text-xs text-ink-muted whitespace-nowrap">
                  {new Date(event.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
