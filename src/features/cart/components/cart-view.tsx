import { Container } from "@/components/ui/container";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { CartEmptyState } from "@/features/cart/components/cart-empty-state";
import { CartItemRow } from "@/features/cart/components/cart-item-row";
import { CartSummary } from "@/features/cart/components/cart-summary";
import type { CartSnapshot } from "@/features/cart/types";

type CartViewProps = {
  cart: CartSnapshot;
  notice?: string | null;
  error?: string | null;
};

export function CartView({ cart, notice, error }: CartViewProps) {
  if (cart.isEmpty) {
    return (
      <>
        <section className="py-12">
          <Container className="space-y-4">
            <div>
              <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
                Your cart
              </p>
              <h1 className="text-foreground mt-2 text-4xl font-semibold tracking-tight">
                Ready when you are
              </h1>
            </div>
            {notice ? <AuthMessage tone="success" message={notice} /> : null}
            {error ? <AuthMessage tone="error" message={error} /> : null}
          </Container>
        </section>
        <CartEmptyState />
      </>
    );
  }

  return (
    <div className="py-12 md:py-16">
      <Container className="space-y-8">
        <div className="space-y-4">
          <div className="space-y-3">
            <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
              Your cart
            </p>
            <h1 className="text-foreground text-4xl font-semibold tracking-tight">
              Review your items
            </h1>
            <p className="text-ink-muted max-w-3xl text-sm leading-7">
              Double-check quantities, availability, and pricing before you move to checkout.
              Final totals are confirmed securely on the server during checkout.
            </p>
          </div>
          {notice ? <AuthMessage tone="success" message={notice} /> : null}
          {error ? <AuthMessage tone="error" message={error} /> : null}
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="space-y-4">
            {cart.items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </section>

          <CartSummary cart={cart} />
        </div>
      </Container>
    </div>
  );
}
