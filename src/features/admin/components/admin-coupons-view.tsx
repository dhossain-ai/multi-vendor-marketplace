import { AuthMessage } from "@/features/auth/components/auth-message";
import { AdminActionButton } from "@/features/admin/components/admin-action-button";
import { AdminStatusBadge } from "@/features/admin/components/admin-status-badge";
import {
  createCouponAction,
  updateCouponAction,
  updateCouponStatusAction,
} from "@/features/admin/lib/admin-actions";
import type { AdminCoupon } from "@/features/admin/types";
import type { SellerOption } from "@/features/shared/types";

type AdminCouponsViewProps = {
  coupons: AdminCoupon[];
  sellerOptions: SellerOption[];
  notice?: string | null;
  error?: string | null;
};

const formatDateTimeLocal = (value: string | null) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

export function AdminCouponsView({
  coupons,
  sellerOptions,
  notice,
  error,
}: AdminCouponsViewProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold tracking-[0.16em] text-brand uppercase">
          Coupon management
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          Coupons
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-ink-muted">
          Create and manage discount codes at the marketplace level. Checkout
          revalidates coupons server-side before discounts are saved to orders.
        </p>
      </div>

      {error ? <AuthMessage tone="error" message={error} /> : null}
      {notice && !error ? <AuthMessage tone="success" message={notice} /> : null}
      <AuthMessage
        tone="info"
        message="Use activation, date windows, limits, and seller scope carefully. Customers only receive valid discounts after checkout revalidation."
      />

      <section className="rounded-[2rem] border border-border bg-panel p-6 shadow-[var(--shadow-panel)]">
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Create coupon
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Coupons can be platform-wide or scoped to an approved seller.
            </p>
          </div>

          <form action={createCouponAction} className="grid gap-4 lg:grid-cols-6">
            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-medium text-foreground">Code</label>
              <input
                name="code"
                required
                minLength={3}
                className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm uppercase text-foreground focus:border-brand focus:outline-none"
                placeholder="SAVE10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Type</label>
              <select
                name="type"
                defaultValue="percentage"
                className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed amount</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Value</label>
              <input
                name="valueAmount"
                type="number"
                required
                min="0.01"
                step="0.01"
                className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                placeholder="10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Minimum order
              </label>
              <input
                name="minimumOrderAmount"
                type="number"
                min="0"
                step="0.01"
                className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                placeholder="50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Scope</label>
              <select
                name="sellerId"
                defaultValue=""
                className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
              >
                <option value="">Platform-wide</option>
                {sellerOptions.map((seller) => (
                  <option key={seller.id} value={seller.id}>
                    {seller.storeName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Total limit</label>
              <input
                name="usageLimitTotal"
                type="number"
                min="1"
                className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Per-user limit</label>
              <input
                name="usageLimitPerUser"
                type="number"
                min="1"
                className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
              />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-medium text-foreground">Starts at</label>
              <input
                name="startsAt"
                type="datetime-local"
                className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
              />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-medium text-foreground">Expires at</label>
              <input
                name="expiresAt"
                type="datetime-local"
                className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
              />
            </div>
            <label className="flex items-center gap-3 text-sm font-medium text-foreground lg:col-span-6">
              <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4 rounded" />
              Active coupon
            </label>
            <div className="lg:col-span-6">
              <AdminActionButton
                idleLabel="Create coupon"
                pendingLabel="Creating..."
                tone="primary"
              />
            </div>
          </form>
        </div>
      </section>

      <div className="space-y-3">
        {coupons.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-border bg-panel p-8 text-center shadow-[var(--shadow-panel)]">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              No coupons yet
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-ink-muted">
              Create a coupon above when the marketplace is ready to offer a
              customer discount.
            </p>
          </div>
        ) : null}
        {coupons.map((coupon) => (
          <article
            key={coupon.id}
            className="rounded-[1.75rem] border border-border bg-panel p-5 shadow-[var(--shadow-panel)]"
          >
            <div className="flex flex-wrap items-center gap-2">
              <AdminStatusBadge label={coupon.isActive ? "active" : "inactive"} />
              <span className="text-xs text-ink-muted">{coupon.type}</span>
              {coupon.sellerName ? (
                <span className="text-xs text-ink-muted">
                  Seller scope: {coupon.sellerName}
                </span>
              ) : (
                <span className="text-xs text-ink-muted">Platform-wide</span>
              )}
            </div>

            <form action={updateCouponAction} className="mt-4 grid gap-4 lg:grid-cols-6">
              <input type="hidden" name="couponId" value={coupon.id} />
              <input type="hidden" name="isActive" value={coupon.isActive ? "true" : "false"} />
              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium text-foreground">Code</label>
                <input
                  name="code"
                  required
                  minLength={3}
                  defaultValue={coupon.code}
                  className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm uppercase text-foreground focus:border-brand focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Type</label>
                <select
                  name="type"
                  defaultValue={coupon.type}
                  className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed amount</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Value</label>
                <input
                  name="valueAmount"
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  defaultValue={coupon.valueAmount}
                  className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Minimum order
                </label>
                <input
                  name="minimumOrderAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={coupon.minimumOrderAmount ?? ""}
                  className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Scope</label>
                <select
                  name="sellerId"
                  defaultValue={coupon.sellerId ?? ""}
                  className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                >
                  <option value="">Platform-wide</option>
                  {sellerOptions.map((seller) => (
                    <option key={seller.id} value={seller.id}>
                      {seller.storeName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Total limit</label>
                <input
                  name="usageLimitTotal"
                  type="number"
                  min="1"
                  defaultValue={coupon.usageLimitTotal ?? ""}
                  className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Per-user limit</label>
                <input
                  name="usageLimitPerUser"
                  type="number"
                  min="1"
                  defaultValue={coupon.usageLimitPerUser ?? ""}
                  className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium text-foreground">Starts at</label>
                <input
                  name="startsAt"
                  type="datetime-local"
                  defaultValue={formatDateTimeLocal(coupon.startsAt)}
                  className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium text-foreground">Expires at</label>
                <input
                  name="expiresAt"
                  type="datetime-local"
                  defaultValue={formatDateTimeLocal(coupon.expiresAt)}
                  className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                />
              </div>
              <div className="lg:col-span-6">
                <AdminActionButton
                  idleLabel="Save coupon"
                  pendingLabel="Saving..."
                  tone="secondary"
                />
              </div>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <form action={updateCouponStatusAction}>
                <input type="hidden" name="couponId" value={coupon.id} />
                <input
                  type="hidden"
                  name="isActive"
                  value={coupon.isActive ? "false" : "true"}
                />
                <AdminActionButton
                  idleLabel={coupon.isActive ? "Deactivate" : "Activate"}
                  pendingLabel="Updating..."
                  tone={coupon.isActive ? "danger" : "primary"}
                />
              </form>
              <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted">
                <span>
                  Created by: {coupon.createdByEmail ?? "unknown admin"}
                </span>
                <span>Updated: {new Date(coupon.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
