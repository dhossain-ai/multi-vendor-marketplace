import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getAuthSessionState, type AuthSessionState } from "@/lib/auth/session";
import type { AppRole } from "@/types/auth";

const buildSignInPath = (nextPath: string) =>
  `/sign-in?next=${encodeURIComponent(nextPath)}`;

const buildAccountPath = (notice: string) =>
  `/account?notice=${encodeURIComponent(notice)}`;

export async function requireAuthenticatedUser(nextPath = "/account") {
  const session = await getAuthSessionState();

  if (!session.user) {
    redirect(buildSignInPath(nextPath));
  }

  return session as AuthSessionState & { user: User };
}

export async function requireRole(
  requiredRole: AppRole | AppRole[],
  nextPath: string,
  unauthorizedNotice: string,
) {
  const session = await requireAuthenticatedUser(nextPath);
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  if (!session.profile || !roles.includes(session.profile.role)) {
    redirect(buildAccountPath(unauthorizedNotice));
  }

  return session;
}

export async function requireSellerRole(nextPath = "/seller") {
  return requireRole(
    "seller",
    nextPath,
    "Seller access is only available to seller accounts.",
  );
}

export async function requireAdminRole(nextPath = "/admin") {
  return requireRole(
    "admin",
    nextPath,
    "Admin access is limited to platform operators.",
  );
}

export function requireApprovedSeller(session: AuthSessionState) {
  if (!session.sellerProfile || session.sellerProfile.status !== "approved") {
    redirect(
      buildAccountPath(
        "Seller dashboard actions require an approved seller profile.",
      ),
    );
  }

  return session;
}
