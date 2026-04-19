import { Container } from "@/components/ui/container";
import { requireAdminRole } from "@/lib/auth/guards";
import { AccessPlaceholder } from "@/features/auth/components/access-placeholder";

export default async function AdminPage() {
  await requireAdminRole("/admin");

  return (
    <div className="py-16">
      <Container>
        <AccessPlaceholder
          eyebrow="Admin access"
          title="Admin protection is ready for later platform controls"
          description="This route stays intentionally minimal for now. It exists to prove the server-side admin role guard before real admin tooling is added."
        />
      </Container>
    </div>
  );
}
