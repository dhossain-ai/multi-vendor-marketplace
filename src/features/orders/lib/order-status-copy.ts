import {
  getFulfillmentStatusLabel,
  getOrderOperationalStageLabel,
} from "@/features/orders/lib/order-progress";
import type {
  FulfillmentStatus,
  OrderStatus,
  PaymentStatus,
} from "@/features/orders/types";

const orderLabels: Record<OrderStatus, string> = {
  pending: "Pending review",
  confirmed: "Confirmed",
  processing: "Processing",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
  partially_refunded: "Partially refunded",
};

const paymentLabels: Record<PaymentStatus, string> = {
  unpaid: "Pending payment",
  processing: "Payment processing",
  paid: "Paid",
  failed: "Payment failed",
  refunded: "Refunded",
  partially_refunded: "Partially refunded",
};

export const getCustomerOrderStatusLabel = (status: OrderStatus) => orderLabels[status];

export const getCustomerPaymentStatusLabel = (status: PaymentStatus) =>
  paymentLabels[status];

export const getCustomerFulfillmentStatusLabel = (status: FulfillmentStatus) =>
  getFulfillmentStatusLabel(status);

export const getCustomerOperationalStageLabel = getOrderOperationalStageLabel;
