import type { SellerStatus } from "@/types/auth";

type SellerStatusDetails = {
  label: string;
  title: string;
  description: string;
  nextStep: string;
};

const statusDetails: Record<SellerStatus, SellerStatusDetails> = {
  pending: {
    label: "Pending review",
    title: "Your seller application is in review",
    description:
      "Your store details have been saved and are waiting for marketplace approval.",
    nextStep:
      "You can keep refining your store profile while you wait, but product and order operations stay locked until approval.",
  },
  approved: {
    label: "Approved",
    title: "Your store is ready to operate",
    description:
      "Your seller account is approved and you can now manage products and review sales.",
    nextStep:
      "Keep your store profile up to date, add products under active categories, and monitor incoming orders.",
  },
  rejected: {
    label: "Not approved",
    title: "Your seller application was not approved",
    description:
      "The marketplace team did not approve the current application details.",
    nextStep:
      "You can update your store information here and contact the marketplace team for another review.",
  },
  suspended: {
    label: "Suspended",
    title: "Your seller account is currently suspended",
    description:
      "Marketplace operations are paused for this store, including creating or updating live inventory.",
    nextStep:
      "Review your store details and contact the marketplace team if you need clarification on the suspension.",
  },
};

export const getSellerStatusDetails = (
  status: SellerStatus | null | undefined,
): SellerStatusDetails | null => {
  if (!status) {
    return null;
  }

  return statusDetails[status];
};

export const getSellerStatusLabel = (status: SellerStatus | null | undefined) =>
  status ? statusDetails[status].label : "Not started";
