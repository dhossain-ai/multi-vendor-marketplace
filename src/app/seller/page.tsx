import { Container } from "@/components/ui/container";
import { requireSellerRole } from "@/lib/auth/guards";
import { AccessPlaceholder } from "@/features/auth/components/access-placeholder";

export default async function SellerPage() {
  const session = await requireSellerRole("/seller");

  return (
    <div className="py-16">
      <Container>
        <AccessPlaceholder
          eyebrow="Seller access"
          title="Seller route protection is wired"
          description="This placeholder confirms seller-only routing is active without shipping any seller dashboard features yet."
          statusLabel={session.sellerProfile?.status ?? "missing profile"}
          nextStep={
            session.sellerProfile?.status === "approved"
              ? "This account is approved and ready for future seller tooling."
              : "Seller dashboard features remain blocked until the seller profile is approved."
          }
        />
      </Container>
    </div>
  );
}
