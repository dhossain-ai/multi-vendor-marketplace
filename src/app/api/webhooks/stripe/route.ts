import { NextResponse } from "next/server";
import {
  handleStripeWebhook,
  PaymentServiceError,
} from "@/features/payments/lib/payment-service";

export const dynamic = "force-dynamic";

/**
 * Stripe webhook endpoint.
 *
 * Receives raw body and Stripe-Signature header, verifies signature,
 * and processes relevant events (checkout.session.completed, checkout.session.expired).
 *
 * Must receive raw body for signature verification — Next.js App Router
 * provides this through request.text().
 */
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 },
    );
  }

  let rawBody: string;

  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json(
      { error: "Unable to read request body." },
      { status: 400 },
    );
  }

  try {
    const result = await handleStripeWebhook(rawBody, signature);

    return NextResponse.json(
      { received: true, handled: result.handled, message: result.message },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof PaymentServiceError) {
      console.error("[stripe-webhook] verification error:", error.message);

      return NextResponse.json(
        { error: error.message },
        { status: 400 },
      );
    }

    console.error("[stripe-webhook] unexpected error:", error);

    return NextResponse.json(
      { error: "Internal webhook processing error." },
      { status: 500 },
    );
  }
}
