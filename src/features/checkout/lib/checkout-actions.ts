"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthenticatedUser } from "@/lib/auth/guards";
import {
  CheckoutOperationError,
  createPendingOrder,
} from "@/features/checkout/lib/checkout-service";

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

export async function submitCheckoutAction() {
  const session = await requireAuthenticatedUser("/checkout");

  try {
    const order = await createPendingOrder(session.user.id);

    revalidatePath("/cart");
    revalidatePath("/checkout");
    revalidatePath("/orders");
    revalidatePath(`/orders/${order.id}`);
    revalidatePath("/", "layout");

    redirect(
      `/orders/${order.id}?notice=${encodeURIComponent(`${order.orderNumber} is now pending payment.`)}`,
    );
  } catch (error) {
    const message =
      error instanceof CheckoutOperationError
        ? error.message
        : "The pending order could not be created from your cart.";

    redirect(buildCheckoutPath({ error: message }));
  }
}
