import Stripe from "stripe";
import { getStripeSecretKey } from "@/lib/config/env";

let stripeInstance: Stripe | null = null;

/**
 * Returns a singleton Stripe SDK instance configured with the test-mode secret key.
 * The instance is created lazily so the secret key is only read when needed.
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(getStripeSecretKey(), {
      typescript: true,
    });
  }

  return stripeInstance;
}
