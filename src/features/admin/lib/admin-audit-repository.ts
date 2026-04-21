import type { Json } from "@/types/database";
import { getAdminDataClient } from "@/features/admin/lib/admin-client";

type AdminAuditInput = {
  adminUserId: string;
  actionType: string;
  targetTable: string;
  targetId?: string | null;
  beforeData?: Json | null;
  afterData?: Json | null;
  reason?: string | null;
};

export async function recordAdminAuditLog(input: AdminAuditInput) {
  try {
    const client = await getAdminDataClient();
    const { error } = await client.from("admin_audit_logs").insert({
      admin_user_id: input.adminUserId,
      action_type: input.actionType,
      target_table: input.targetTable,
      target_id: input.targetId ?? null,
      before_data: input.beforeData ?? null,
      after_data: input.afterData ?? null,
      reason: input.reason ?? null,
    });

    if (error) {
      console.error("Failed to record admin audit log.", error);
    }
  } catch (error) {
    console.error("Failed to record admin audit log.", error);
  }
}
