export type AppRole = "customer" | "seller" | "admin";

export type SellerStatus = "pending" | "approved" | "rejected" | "suspended";

export type AppProfile = {
  id: string;
  email: string;
  fullName: string | null;
  role: AppRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SellerProfile = {
  id: string;
  userId: string;
  storeName: string;
  slug: string | null;
  status: SellerStatus;
  bio: string | null;
  logoUrl: string | null;
  supportEmail: string | null;
  businessEmail: string | null;
  phone: string | null;
  countryCode: string | null;
  agreementAcceptedAt: string | null;
  rejectionReason: string | null;
  suspensionReason: string | null;
  resubmittedAt: string | null;
  commissionRateBps: number | null;
  approvedAt: string | null;
  approvedBy: string | null;
  createdAt: string;
  updatedAt: string;
};
