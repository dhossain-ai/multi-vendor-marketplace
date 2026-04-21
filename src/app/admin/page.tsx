import type { Metadata } from "next";
import { AdminDashboardView } from "@/features/admin/components/admin-dashboard-view";
import { getAdminDashboardSummary } from "@/features/admin/lib/admin-dashboard-repository";
import { requireAdminRole } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Platform overview and operational admin controls.",
};

export default async function AdminPage() {
  const session = await requireAdminRole("/admin");
  const summary = await getAdminDashboardSummary();

  return (
    <AdminDashboardView
      summary={summary}
      adminName={session.profile?.fullName ?? session.profile?.email ?? "Platform operator"}
    />
  );
}
