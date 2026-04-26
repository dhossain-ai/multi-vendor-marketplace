import { AuthMessage } from "@/features/auth/components/auth-message";
import { AdminActionButton } from "@/features/admin/components/admin-action-button";
import { AdminStatusBadge } from "@/features/admin/components/admin-status-badge";
import { updateSellerStatusAction } from "@/features/admin/lib/admin-actions";
import type { AdminSeller, AdminSellerStatus } from "@/features/admin/types";
import Link from "next/link";

type AdminSellersViewProps = {
  sellers: AdminSeller[];
  currentStatus: AdminSellerStatus | null;
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

export function AdminSellersView({
  sellers,
  currentStatus,
  notice,
  error,
}: AdminSellersViewProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold tracking-[0.16em] text-brand uppercase">
          Seller moderation
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          Sellers
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-ink-muted">
          Review seller applications, update status carefully, and keep store access
          aligned with marketplace policy.
        </p>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3 rounded-[1.75rem] border border-border bg-panel p-5 shadow-[var(--shadow-panel)]">
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium text-foreground">
            Filter by status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={currentStatus ?? ""}
            className="block min-w-48 rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-white"
        >
          Apply filter
        </button>
      </form>

      {error ? <AuthMessage tone="error" message={error} /> : null}
      {notice && !error ? <AuthMessage tone="success" message={notice} /> : null}

      {sellers.length === 0 ? (
        <div className="rounded-[2rem] border border-border bg-panel p-10 text-center shadow-[var(--shadow-panel)]">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            No sellers found
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-ink-muted">
            There are no sellers matching the current moderation filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sellers.map((seller) => (
            <article
              key={seller.id}
              className="rounded-[1.75rem] border border-border bg-panel p-5 shadow-[var(--shadow-panel)]"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <AdminStatusBadge label={seller.status} />
                    {seller.slug ? (
                      <span className="text-xs text-ink-muted">/{seller.slug}</span>
                    ) : null}
                  </div>
                  <div>
                    <Link href={`/admin/sellers/${seller.id}`} className="hover:underline">
                      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                        {seller.storeName}
                      </h2>
                    </Link>
                    <p className="mt-1 text-sm text-ink-muted">
                      {seller.ownerName ?? "Seller owner"} · {seller.ownerEmail ?? "No email recorded"}
                    </p>
                  </div>
                  {seller.bio ? (
                    <p className="max-w-3xl text-sm leading-7 text-ink-muted">
                      {seller.bio}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  {sellerActions[seller.status].map((nextStatus) => (
                    <form key={nextStatus} action={updateSellerStatusAction}>
                      <input type="hidden" name="sellerId" value={seller.id} />
                      <input type="hidden" name="status" value={nextStatus} />
                      <AdminActionButton
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
                    </form>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-ink-muted">
                <span>Products: {seller.productCount}</span>
                <span>Created: {new Date(seller.createdAt).toLocaleDateString()}</span>
                {seller.approvedAt ? (
                  <span>Approved: {new Date(seller.approvedAt).toLocaleString()}</span>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
