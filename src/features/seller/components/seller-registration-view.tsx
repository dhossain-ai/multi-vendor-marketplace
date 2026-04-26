import Link from "next/link";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { SellerApplicationForm } from "@/features/seller/components/seller-application-form";
import { getSellerStatusLabel } from "@/features/seller/lib/seller-status";
import type { SellerApplicationFormData } from "@/features/seller/types";
import type { AppProfile, SellerProfile } from "@/types/auth";

type SellerRegistrationViewProps = {
  profile: AppProfile | null;
  sellerProfile: SellerProfile | null;
  notice?: string | null;
  error?: string | null;
  action: (formData: FormData) => Promise<void>;
};

const buildInitialValues = (
  sellerProfile: SellerProfile | null,
): Partial<SellerApplicationFormData> | null =>
  sellerProfile
    ? {
        storeName: sellerProfile.storeName,
        slug: sellerProfile.slug ?? "",
        bio: sellerProfile.bio ?? "",
        logoUrl: sellerProfile.logoUrl,
        supportEmail: sellerProfile.supportEmail ?? "",
        businessEmail: sellerProfile.businessEmail,
        phone: sellerProfile.phone,
        countryCode: sellerProfile.countryCode ?? "",
      }
    : null;

function SignedOutState() {
  const next = encodeURIComponent("/seller/register");

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
          Seller application
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          Create your account first
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-ink-muted">
          Seller applications are tied to a verified customer account. Create an account or sign in, then return here to complete your store application.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/sign-up?next=${next}`}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white"
          >
            Create account
          </Link>
          <Link
            href={`/sign-in?next=${next}`}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-panel px-6 text-sm font-medium text-foreground"
          >
            Sign in
          </Link>
        </div>
      </div>

      <aside className="rounded-[2rem] border border-border bg-panel p-6 shadow-[var(--shadow-panel)]">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
          What happens next
        </p>
        <ol className="mt-4 space-y-3 text-sm leading-7 text-ink-muted">
          <li>1. Confirm your account email.</li>
          <li>2. Add your store details.</li>
          <li>3. Submit for marketplace review.</li>
        </ol>
      </aside>
    </div>
  );
}

export function SellerRegistrationView({
  profile,
  sellerProfile,
  notice,
  error,
  action,
}: SellerRegistrationViewProps) {
  if (!profile) {
    return <SignedOutState />;
  }

  if (profile.role === "admin") {
    return (
      <AuthMessage
        tone="info"
        message="Admin accounts cannot apply through the seller onboarding flow."
      />
    );
  }

  if (sellerProfile?.status === "pending") {
    return (
      <div className="max-w-3xl space-y-5">
        {notice ? <AuthMessage tone="success" message={notice} /> : null}
        {error ? <AuthMessage tone="error" message={error} /> : null}
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
          Seller application
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          Your application is in review
        </h1>
        <p className="text-sm leading-7 text-ink-muted">
          Current status: {getSellerStatusLabel(sellerProfile.status)}. The marketplace team will review your store details before seller tools are activated.
        </p>
        <Link
          href="/account"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-panel px-5 text-sm font-medium text-foreground"
        >
          Back to account
        </Link>
      </div>
    );
  }

  if (sellerProfile?.status === "suspended") {
    return (
      <div className="max-w-3xl space-y-5">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
          Seller application
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          Seller account suspended
        </h1>
        <p className="text-sm leading-7 text-ink-muted">
          This seller account cannot submit a new application right now. Contact marketplace support for next steps.
        </p>
        {sellerProfile.suspensionReason ? (
          <AuthMessage tone="error" message={sellerProfile.suspensionReason} />
        ) : null}
      </div>
    );
  }

  const isResubmission = sellerProfile?.status === "rejected";

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
          Seller application
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          {isResubmission ? "Update and resubmit your store" : "Apply to sell"}
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-ink-muted">
          Share the store details the marketplace team needs for review. Approval is manual, and seller tools stay locked until your application is approved.
        </p>
      </div>

      {isResubmission && sellerProfile?.rejectionReason ? (
        <AuthMessage tone="error" message={sellerProfile.rejectionReason} />
      ) : null}

      <SellerApplicationForm
        mode={isResubmission ? "resubmit" : "apply"}
        initialValues={buildInitialValues(sellerProfile)}
        notice={notice}
        error={error}
        action={action}
      />
    </div>
  );
}
