import Link from "next/link";
import { SellerStoreProfileForm } from "@/features/seller/components/seller-store-profile-form";
import { getSellerStatusDetails, getSellerStatusLabel } from "@/features/seller/lib/seller-status";
import type { SellerStoreProfileFormData } from "@/features/seller/types";
import type { SellerProfile } from "@/types/auth";

type SellerStoreSetupViewProps = {
  mode: "apply" | "edit";
  sellerProfile: SellerProfile | null;
  notice?: string | null;
  error?: string | null;
  action: (formData: FormData) => Promise<void>;
};

const buildInitialValues = (
  sellerProfile: SellerProfile | null,
): SellerStoreProfileFormData | null =>
  sellerProfile
    ? {
        storeName: sellerProfile.storeName,
        slug: sellerProfile.slug ?? "",
        bio: sellerProfile.bio ?? "",
        logoUrl: sellerProfile.logoUrl ?? null,
        supportEmail: sellerProfile.supportEmail ?? "",
        businessEmail: sellerProfile.businessEmail ?? null,
        phone: sellerProfile.phone ?? null,
        countryCode: sellerProfile.countryCode ?? "",
      }
    : null;

export function SellerStoreSetupView({
  mode,
  sellerProfile,
  notice,
  error,
  action,
}: SellerStoreSetupViewProps) {
  const statusDetails = getSellerStatusDetails(sellerProfile?.status);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-brand text-sm font-semibold uppercase tracking-[0.16em]">
          {mode === "apply" ? "Become a seller" : "Store settings"}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          {mode === "apply"
            ? "Set up your store application"
            : sellerProfile?.storeName ?? "Update your store profile"}
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-ink-muted">
          {mode === "apply"
            ? "Create your store identity inside the app, then send it for marketplace review."
            : "Update the store details customers and marketplace operators will see while your seller account is reviewed or active."}
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <SellerStoreProfileForm
          mode={mode}
          status={sellerProfile?.status}
          initialValues={buildInitialValues(sellerProfile)}
          notice={notice}
          error={error}
          action={action}
        />

        <aside className="space-y-4">
          {sellerProfile ? (
            <section className="rounded-[2rem] border border-border bg-panel p-6 shadow-[var(--shadow-panel)]">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                    Seller status
                  </p>
                  <div className="inline-flex rounded-full bg-panel-muted px-3 py-1 text-xs font-semibold text-foreground">
                    {getSellerStatusLabel(sellerProfile.status)}
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    {statusDetails?.title ?? "Store profile saved"}
                  </h2>
                  <p className="text-sm leading-7 text-ink-muted">
                    {statusDetails?.description ??
                      "Your store profile is saved and ready for seller operations."}
                  </p>
                  <p className="text-sm leading-7 text-ink-muted">
                    {statusDetails?.nextStep ??
                      "Keep your store details current so customers and admins always see accurate information."}
                  </p>
                </div>
              </div>
            </section>
          ) : (
            <section className="rounded-[2rem] border border-border bg-panel p-6 shadow-[var(--shadow-panel)]">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                  What happens next
                </p>
                <ol className="space-y-3 text-sm leading-7 text-ink-muted">
                  <li>1. Save your store name, slug, and description.</li>
                  <li>2. The marketplace team reviews your application.</li>
                  <li>3. Once approved, your seller dashboard opens for products and orders.</li>
                </ol>
              </div>
            </section>
          )}

          <section className="rounded-[2rem] border border-border bg-panel p-6 shadow-[var(--shadow-panel)]">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                Store essentials
              </p>
              <ul className="space-y-2 text-sm leading-7 text-ink-muted">
                <li>Use a clear store name customers can recognize.</li>
                <li>Pick a stable slug for marketplace references and future store URLs.</li>
                <li>Add a short bio so admins can review your application with context.</li>
              </ul>
            </div>
          </section>

          {sellerProfile?.status === "approved" ? (
            <section className="rounded-[2rem] border border-border bg-panel p-6 shadow-[var(--shadow-panel)]">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                  Next steps
                </p>
                <div className="flex flex-col gap-3">
                  <Link
                    href="/seller/products/new"
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-white"
                  >
                    Add your first product
                  </Link>
                  <Link
                    href="/seller/orders"
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-panel-muted px-5 text-sm font-medium text-foreground"
                  >
                    Review store orders
                  </Link>
                </div>
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
