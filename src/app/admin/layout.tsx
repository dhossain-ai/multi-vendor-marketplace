import { Container } from "@/components/ui/container";
import { AdminNav } from "@/features/admin/components/admin-nav";
import { requireAdminRole } from "@/lib/auth/guards";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminRole("/admin");

  return (
    <div className="py-12 md:py-16">
      <Container>
        <div className="space-y-8">
          <AdminNav />
          {children}
        </div>
      </Container>
    </div>
  );
}
