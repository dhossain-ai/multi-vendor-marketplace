"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthenticatedUser } from "@/lib/auth/guards";
import { hasStripeEnv } from "@/lib/config/env";
import {
  CheckoutOperationError,
  createPendingOrder,
} from "@/features/checkout/lib/checkout-service";
import {
  createPaymentSessionForOrder,
  PaymentServiceError,
} from "@/features/payments/lib/payment-service";

const buildCheckoutPath = (params?: { error?: string; notice?: string }) => {
  const searchParams = new URLSearchParams();

  if (params?.error) {
    searchParams.set("error", params.error);
  }

  if (params?.notice) {
    searchParams.set("notice", params.notice);
  }

  const query = searchParams.toString();

  return query ? `/checkout?${query}` : "/checkout";
};

const getShippingAddressId = (formData: FormData) => {
  const value = formData.get("shippingAddressId");

  return typeof value === "string" ? value.trim() : "";
};

export async function submitCheckoutAction(formData: FormData) {
  const session = await requireAuthenticatedUser("/checkout");
  const shippingAddressId = getShippingAddressId(formData);

  try {
    const order = await createPendingOrder(session.user.id, shippingAddressId);

    revalidatePath("/cart");
    revalidatePath("/checkout");
    revalidatePath("/orders");
    revalidatePath(`/orders/${order.id}`);
    revalidatePath("/", "layout");

    // If Stripe env is configured, create a payment session and redirect
    if (hasStripeEnv()) {
      try {
        const paymentSession = await createPaymentSessionForOrder(
          order.id,
          session.user.id,
        );

        redirect(paymentSession.checkoutUrl);
      } catch (paymentError) {
        // Payment session creation failed — order exists but stays unpaid/pending.
        // Redirect to order detail so the user can retry payment.
        const message =
          paymentError instanceof PaymentServiceError
            ? paymentError.message
            : "Payment session could not be created. You can retry from your order.";

        redirect(
          `/orders/${order.id}?error=${encodeURIComponent(message)}`,
        );
      }
    }

    // No Stripe env — fall back to Phase 5 behavior (redirect to order detail)
    redirect(
      `/orders/${order.id}?notice=${encodeURIComponent(`${order.orderNumber} is now pending payment.`)}`,
    );
  } catch (error) {
    // Re-throw redirect errors (Next.js uses thrown redirects)
    if (error instanceof Error && "digest" in error) {
      throw error;
    }

    const message =
      error instanceof CheckoutOperationError
        ? error.message
        : "The pending order could not be created from your cart.";

    redirect(buildCheckoutPath({ error: message }));
  }
}

/**
 * Start a payment session for an existing unpaid order.
 * Used from the order detail "Pay now" / "Retry payment" button.
 */
export async function startPaymentAction(orderId: string) {
  const session = await requireAuthenticatedUser(`/orders/${orderId}`);

  try {
    const paymentSession = await createPaymentSessionForOrder(
      orderId,
      session.user.id,
    );

    redirect(paymentSession.checkoutUrl);
  } catch (error) {
    // Re-throw redirect errors
    if (error instanceof Error && "digest" in error) {
      throw error;
    }

    const message =
      error instanceof PaymentServiceError
        ? error.message
        : "Unable to start payment for this order.";

    redirect(
      `/orders/${orderId}?error=${encodeURIComponent(message)}`,
    );
  }
}
