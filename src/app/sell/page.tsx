import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { requireAuthenticatedUser } from "@/lib/auth/guards";
import { readSearchParam } from "@/lib/auth/navigation";
import { SellerStoreSetupView } from "@/features/seller/components/seller-store-setup-view";
import { createSellerApplicationAction } from "@/features/seller/lib/seller-actions";

type SellPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Become a Seller",
  description: "Apply to open a store and sell through the marketplace.",
};

export default async function SellPage({ searchParams }: SellPageProps) {
  const session = await requireAuthenticatedUser("/sell");
  const search = await searchParams;

  if (!session.profile) {
    redirect("/account?notice=" + encodeURIComponent("Account profile not found."));
  }

  if (session.profile.role === "admin") {
    redirect(
      "/account?notice=" +
        encodeURIComponent("Admin accounts cannot apply through the seller onboarding flow."),
    );
  }

  if (session.sellerProfile) {
    redirect(session.sellerProfile.status === "approved" ? "/seller" : "/seller/settings");
  }

  return (
    <div className="py-12 md:py-16">
      <Container>
        <SellerStoreSetupView
          mode="apply"
          sellerProfile={null}
          notice={readSearchParam(search.notice)}
          error={readSearchParam(search.error)}
          action={createSellerApplicationAction}
        />
      </Container>
    </div>
  );
}
