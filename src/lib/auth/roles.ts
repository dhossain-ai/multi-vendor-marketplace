import type { AppRole, SellerStatus } from "@/types/auth";

export const appRoles: AppRole[] = ["customer", "seller", "admin"];
export const sellerStatuses: SellerStatus[] = [
  "pending",
  "approved",
  "rejected",
  "suspended",
];

export const isAppRole = (value: string): value is AppRole =>
  appRoles.includes(value as AppRole);

export const isSellerStatus = (value: string): value is SellerStatus =>
  sellerStatuses.includes(value as SellerStatus);

export const canAccessSellerWorkspace = (
  role: AppRole,
  sellerStatus?: SellerStatus,
) => role === "seller" && sellerStatus === "approved";
