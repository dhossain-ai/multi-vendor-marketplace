import { randomUUID } from "node:crypto";
import type Stripe from "stripe";
import { getStripeWebhookSecret } from "@/lib/config/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseServiceRoleEnv } from "@/lib/config/env";
import { getStripe } from "@/features/payments/lib/stripe";
import {
  createPaymentRecord,
  getPaymentByProviderSessionId,
  getPaymentByOrderId,
  updatePaymentStatus,
  updateOrderPaymentStatus,
} from "@/features/payments/lib/payment-repository";
import type {
  CreatePaymentSessionResult,
  StripeWebhookResult,
} from "@/features/payments/types";
import type { Json } from "@/types/database";

type OrderRow = {
  id?: string | null;
  order_number?: string | null;
  customer_id?: string | null;
  order_status?: string | null;
  payment_status?: string | null;
  total_amount?: number | string | null;
  currency_code?: string | null;
};

export class PaymentServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentServiceError";
  }
}

const getServiceClient = async () =>
  hasSupabaseServiceRoleEnv()
    ? createSupabaseAdminClient()
    : createSupabaseServerClient();

const TERMINAL_PAYMENT_STATUSES = new Set(["paid", "refunded", "partially_refunded"]);

/**
 * Create a Stripe Checkout Session for an existing pending order.
 *
 * Idempotency: if a payment record already exists for this order with a valid
 * Stripe session, we reuse it instead of creating a duplicate.
 */
export async function createPaymentSessionForOrder(
  orderId: string,
  userId: string,
): Promise<CreatePaymentSessionResult> {
  const client = await getServiceClient();

  // Load and validate order
  const { data: orderData, error: orderError } = await client
    .from("orders")
    .select("id, order_number, customer_id, order_status, payment_status, total_amount, currency_code")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !orderData) {
    throw new PaymentServiceError("Order not found.");
  }

  const order = orderData as OrderRow;

  if (order.customer_id !== userId) {
    throw new PaymentServiceError("Order does not belong to this user.");
  }

  if (order.order_status !== "pending") {
    throw new PaymentServiceError("Only pending orders can start a payment session.");
  }

  if (TERMINAL_PAYMENT_STATUSES.has(order.payment_status ?? "")) {
    throw new PaymentServiceError("This order cannot start another payment session.");
  }

  const totalAmount = Number(order.total_amount);
  const currencyCode = order.currency_code ?? "USD";

  if (!totalAmount || totalAmount <= 0) {
    throw new PaymentServiceError("Order total is not valid for payment.");
  }

  // Idempotency: check for existing payment record
  const existingPayment = await getPaymentByOrderId(orderId);

  if (existingPayment && existingPayment.status === "processing" && existingPayment.providerSessionId) {
    // Attempt to retrieve the existing Stripe session
    try {
      const stripe = getStripe();
      const existingSession = await stripe.checkout.sessions.retrieve(existingPayment.providerSessionId);

      if (existingSession.url && existingSession.status === "open") {
        return {
          checkoutUrl: existingSession.url,
          paymentId: existingPayment.id,
          providerSessionId: existingPayment.providerSessionId,
        };
      }
    } catch {
      // Session expired or invalid — create a new one
    }
  }

  const lineItems = [
    {
      price_data: {
        currency: currencyCode.toLowerCase(),
        product_data: {
          name: `Marketplace order ${order.order_number ?? orderId}`,
        },
        unit_amount: Math.round(totalAmount * 100),
      },
      quantity: 1,
    },
  ];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const idempotencyKey = randomUUID();

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      metadata: {
        order_id: orderId,
        order_number: order.order_number ?? "",
      },
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/cancel?order_id=${orderId}`,
    },
    {
      idempotencyKey,
    },
  );

  if (!session.url) {
    throw new PaymentServiceError("Stripe did not return a checkout URL.");
  }

  // Create payment record
  const paymentRecord = await createPaymentRecord({
    orderId,
    provider: "stripe",
    providerSessionId: session.id,
    amount: totalAmount,
    currencyCode,
    idempotencyKey,
  });

  return {
    checkoutUrl: session.url,
    paymentId: paymentRecord.id,
    providerSessionId: session.id,
  };
}

/**
 * Handle incoming Stripe webhook events.
 *
 * Verifies signature, processes relevant events, and updates payment/order state.
 * Designed to be idempotent — duplicate deliveries are safely ignored.
 */
export async function handleStripeWebhook(
  rawBody: string | Buffer,
  signature: string,
): Promise<StripeWebhookResult> {
  const stripe = getStripe();
  const webhookSecret = getStripeWebhookSecret();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid webhook signature";
    throw new PaymentServiceError(`Webhook verification failed: ${message}`);
  }

  switch (event.type) {
    case "checkout.session.completed":
      return handleCheckoutSessionCompleted(event);

    case "checkout.session.expired":
      return handleCheckoutSessionExpired(event);

    default:
      return {
        handled: false,
        event: event.type,
        message: `Event type ${event.type} is not handled.`,
      };
  }
}

async function handleCheckoutSessionCompleted(
  event: Stripe.Event,
): Promise<StripeWebhookResult> {
  const session = event.data.object as Stripe.Checkout.Session;
  const sessionId = session.id;
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const payment = await getPaymentByProviderSessionId(sessionId);

  if (!payment) {
    return {
      handled: false,
      event: event.type,
      message: `No payment record found for session ${sessionId}.`,
    };
  }

  // Idempotency: skip if already in terminal state
  if (TERMINAL_PAYMENT_STATUSES.has(payment.status)) {
    return {
      handled: true,
      event: event.type,
      message: `Payment ${payment.id} already in terminal state (${payment.status}). Skipping.`,
    };
  }

  // Update payment record
  await updatePaymentStatus({
    paymentId: payment.id,
    status: "paid",
    providerPaymentId: paymentIntentId,
    rawProviderPayload: JSON.parse(JSON.stringify(session)) as Json,
    paidAt: new Date().toISOString(),
  });

  // Update order statuses
  await updateOrderPaymentStatus({
    orderId: payment.orderId,
    paymentStatus: "paid",
    orderStatus: "confirmed",
  });

  return {
    handled: true,
    event: event.type,
    message: `Payment ${payment.id} confirmed. Order updated to confirmed/paid.`,
  };
}

async function handleCheckoutSessionExpired(
  event: Stripe.Event,
): Promise<StripeWebhookResult> {
  const session = event.data.object as Stripe.Checkout.Session;
  const sessionId = session.id;

  const payment = await getPaymentByProviderSessionId(sessionId);

  if (!payment) {
    return {
      handled: false,
      event: event.type,
      message: `No payment record found for expired session ${sessionId}.`,
    };
  }

  // Idempotency: skip if already in terminal state
  if (TERMINAL_PAYMENT_STATUSES.has(payment.status)) {
    return {
      handled: true,
      event: event.type,
      message: `Payment ${payment.id} already in terminal state (${payment.status}). Skipping expiry.`,
    };
  }

  // Already failed — skip
  if (payment.status === "failed") {
    return {
      handled: true,
      event: event.type,
      message: `Payment ${payment.id} already failed. Skipping.`,
    };
  }

  await updatePaymentStatus({
    paymentId: payment.id,
    status: "failed",
    rawProviderPayload: JSON.parse(JSON.stringify(session)) as Json,
  });

  await updateOrderPaymentStatus({
    orderId: payment.orderId,
    paymentStatus: "failed",
  });

  return {
    handled: true,
    event: event.type,
    message: `Payment ${payment.id} marked failed due to session expiry.`,
  };
}
