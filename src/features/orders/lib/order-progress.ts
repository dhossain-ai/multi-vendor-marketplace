import type { OrderStatus, PaymentStatus, FulfillmentStatus } from "@/features/orders/types";

export type OrderOperationalStage =
  | "pending_payment"
  | "payment_processing"
  | "payment_failed"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "partially_refunded";

export const getFulfillmentStatusLabel = (status: FulfillmentStatus) => {
  switch (status) {
    case "unfulfilled":
      return "Confirmed";
    case "processing":
      return "Processing";
    case "shipped":
      return "Shipped";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
};

export const getOrderOperationalStageLabel = (stage: OrderOperationalStage) => {
  switch (stage) {
    case "pending_payment":
      return "Pending payment";
    case "payment_processing":
      return "Payment processing";
    case "payment_failed":
      return "Payment failed";
    case "confirmed":
      return "Confirmed";
    case "processing":
      return "Processing";
    case "shipped":
      return "Shipped";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    case "refunded":
      return "Refunded";
    case "partially_refunded":
      return "Partially refunded";
    default:
      return stage;
  }
};

export const getOrderOperationalStageDescription = (stage: OrderOperationalStage) => {
  switch (stage) {
    case "pending_payment":
      return "This order is waiting for a successful payment before fulfillment can begin.";
    case "payment_processing":
      return "Payment is still being verified with the provider.";
    case "payment_failed":
      return "The last payment attempt did not succeed. A new payment attempt is needed.";
    case "confirmed":
      return "Payment is confirmed and the order is queued for seller fulfillment.";
    case "processing":
      return "The seller is preparing this order for shipment.";
    case "shipped":
      return "The seller marked this order as shipped.";
    case "delivered":
      return "All fulfilled items in this order have been delivered.";
    case "cancelled":
      return "This order was cancelled and is no longer moving through fulfillment.";
    case "refunded":
      return "The order was refunded.";
    case "partially_refunded":
      return "Part of this order has been refunded.";
    default:
      return "This order is being reviewed.";
  }
};

const allStatusesAre = (
  statuses: FulfillmentStatus[],
  expected: FulfillmentStatus,
) => statuses.length > 0 && statuses.every((status) => status === expected);

export const deriveOperationalStage = (input: {
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatuses: FulfillmentStatus[];
}): OrderOperationalStage => {
  if (input.orderStatus === "cancelled") {
    return "cancelled";
  }

  if (input.orderStatus === "refunded" || input.paymentStatus === "refunded") {
    return "refunded";
  }

  if (
    input.orderStatus === "partially_refunded" ||
    input.paymentStatus === "partially_refunded"
  ) {
    return "partially_refunded";
  }

  if (input.paymentStatus === "failed") {
    return "payment_failed";
  }

  if (input.paymentStatus === "processing") {
    return "payment_processing";
  }

  if (input.paymentStatus !== "paid") {
    return "pending_payment";
  }

  const activeStatuses = input.fulfillmentStatuses.filter(
    (status) => status !== "cancelled",
  );

  if (allStatusesAre(activeStatuses, "delivered")) {
    return "delivered";
  }

  if (activeStatuses.some((status) => status === "shipped")) {
    return "shipped";
  }

  if (activeStatuses.some((status) => status === "processing")) {
    return "processing";
  }

  return "confirmed";
};

export const getOperationalStageTone = (stage: OrderOperationalStage) => {
  switch (stage) {
    case "confirmed":
    case "delivered":
      return "success";
    case "processing":
    case "shipped":
    case "payment_processing":
      return "info";
    case "pending_payment":
      return "warning";
    case "payment_failed":
    case "cancelled":
      return "danger";
    case "refunded":
    case "partially_refunded":
      return "neutral";
    default:
      return "neutral";
  }
};
