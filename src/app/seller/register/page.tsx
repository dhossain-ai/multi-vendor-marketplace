import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { readSearchParam } from "@/lib/auth/navigation";
import { getAuthSessionState } from "@/lib/auth/session";
import { SellerRegistrationView } from "@/features/seller/components/seller-registration-view";
import { submitSellerApplicationAction } from "@/features/seller/lib/seller-actions";

type SellerRegisterPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Apply to Sell",
  description: "Create or resubmit a seller application for marketplace review.",
};

export default async function SellerRegisterPage({
  searchParams,
}: SellerRegisterPageProps) {
  const [session, search] = await Promise.all([
    getAuthSessionState(),
    searchParams,
  ]);

  if (session.profile?.role === "seller" && session.sellerProfile?.status === "approved") {
    redirect("/seller");
  }

  return (
    <SellerRegistrationView
      profile={session.profile}
      sellerProfile={session.sellerProfile}
      notice={readSearchParam(search.notice)}
      error={readSearchParam(search.error)}
      action={submitSellerApplicationAction}
    />
  );
}
