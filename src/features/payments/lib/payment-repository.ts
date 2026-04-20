import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseServiceRoleEnv } from "@/lib/config/env";
import type { Database, Json } from "@/types/database";
import type { PaymentRecord, PaymentRecordStatus } from "@/features/payments/types";

type PaymentRow = {
  id?: string | null;
  order_id?: string | null;
  provider?: string | null;
  provider_session_id?: string | null;
  provider_payment_id?: string | null;
  status?: string | null;
  amount?: number | string | null;
  currency_code?: string | null;
  idempotency_key?: string | null;
  raw_provider_payload?: Json | null;
  paid_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const getPaymentClient = async () =>
  hasSupabaseServiceRoleEnv()
    ? createSupabaseAdminClient()
    : createSupabaseServerClient();

const mapPaymentRow = (row: PaymentRow): PaymentRecord | null => {
  if (
    !row.id ||
    !row.order_id ||
    !row.provider ||
    !row.status ||
    row.amount == null ||
    !row.currency_code ||
    !row.created_at ||
    !row.updated_at
  ) {
    return null;
  }

  return {
    id: row.id,
    orderId: row.order_id,
    provider: row.provider as PaymentRecord["provider"],
    providerSessionId: row.provider_session_id ?? null,
    providerPaymentId: row.provider_payment_id ?? null,
    status: row.status as PaymentRecordStatus,
    amount: Number(row.amount),
    currencyCode: row.currency_code,
    idempotencyKey: row.idempotency_key ?? null,
    rawProviderPayload: row.raw_provider_payload ?? null,
    paidAt: row.paid_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export class PaymentRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentRepositoryError";
  }
}

/**
 * Create a new payment record in `processing` state with the Stripe session ID.
 */
export async function createPaymentRecord(input: {
  orderId: string;
  provider: string;
  providerSessionId: string;
  amount: number;
  currencyCode: string;
  idempotencyKey: string;
}): Promise<PaymentRecord> {
  const client = await getPaymentClient();

  const { data, error } = await client
    .from("payments")
    .insert({
      order_id: input.orderId,
      provider: input.provider,
      provider_session_id: input.providerSessionId,
      status: "processing",
      amount: input.amount,
      currency_code: input.currencyCode,
      idempotency_key: input.idempotencyKey,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new PaymentRepositoryError("Unable to create payment record.");
  }

  const mapped = mapPaymentRow(data as PaymentRow);

  if (!mapped) {
    throw new PaymentRepositoryError("Created payment record could not be read.");
  }

  return mapped;
}

/**
 * Look up payment by Stripe Checkout Session ID. Used in webhook handler.
 */
export async function getPaymentByProviderSessionId(
  sessionId: string,
): Promise<PaymentRecord | null> {
  const client = await getPaymentClient();

  const { data, error } = await client
    .from("payments")
    .select("*")
    .eq("provider_session_id", sessionId)
    .maybeSingle();

  if (error) {
    throw new PaymentRepositoryError("Unable to look up payment by provider session.");
  }

  return data ? mapPaymentRow(data as PaymentRow) : null;
}

/**
 * Look up the latest payment for an order. Used in order detail display.
 */
export async function getPaymentByOrderId(
  orderId: string,
): Promise<PaymentRecord | null> {
  const client = await getPaymentClient();

  const { data, error } = await client
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new PaymentRepositoryError("Unable to look up payment for order.");
  }

  return data ? mapPaymentRow(data as PaymentRow) : null;
}

/**
 * Update payment status after provider confirmation. Idempotent: callers should
 * check current status before calling.
 */
export async function updatePaymentStatus(input: {
  paymentId: string;
  status: PaymentRecordStatus;
  providerPaymentId?: string | null;
  rawProviderPayload?: Json | null;
  paidAt?: string | null;
}): Promise<void> {
  const client = await getPaymentClient();

  type PaymentUpdate = Database["public"]["Tables"]["payments"]["Update"];

  const updateData: PaymentUpdate = {
    status: input.status,
  };

  if (input.providerPaymentId !== undefined) {
    updateData.provider_payment_id = input.providerPaymentId;
  }

  if (input.rawProviderPayload !== undefined) {
    updateData.raw_provider_payload = input.rawProviderPayload;
  }

  if (input.paidAt !== undefined) {
    updateData.paid_at = input.paidAt;
  }

  const { error } = await client
    .from("payments")
    .update(updateData)
    .eq("id", input.paymentId);

  if (error) {
    throw new PaymentRepositoryError("Unable to update payment status.");
  }
}

/**
 * Update order's payment_status and optionally order_status after payment confirmation.
 */
export async function updateOrderPaymentStatus(input: {
  orderId: string;
  paymentStatus: string;
  orderStatus?: string;
}): Promise<void> {
  const client = await getPaymentClient();

  type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"];

  const updateData: OrderUpdate = {
    payment_status: input.paymentStatus as OrderUpdate["payment_status"],
  };

  if (input.orderStatus) {
    updateData.order_status = input.orderStatus as OrderUpdate["order_status"];
  }

  const { error } = await client
    .from("orders")
    .update(updateData)
    .eq("id", input.orderId);

  if (error) {
    throw new PaymentRepositoryError("Unable to update order payment status.");
  }
}
