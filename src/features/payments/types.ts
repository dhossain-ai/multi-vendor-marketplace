import type { Json } from "@/types/database";

export type PaymentProvider = "stripe";

export type PaymentRecordStatus =
  | "processing"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

export type PaymentRecord = {
  id: string;
  orderId: string;
  provider: PaymentProvider;
  providerSessionId: string | null;
  providerPaymentId: string | null;
  status: PaymentRecordStatus;
  amount: number;
  currencyCode: string;
  idempotencyKey: string | null;
  rawProviderPayload: Json | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreatePaymentSessionResult = {
  checkoutUrl: string;
  paymentId: string;
  providerSessionId: string;
};

export type StripeWebhookResult = {
  handled: boolean;
  event: string;
  message: string;
};
