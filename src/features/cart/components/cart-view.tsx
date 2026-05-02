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
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
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
            <div className="rounded-[1.5rem] border border-border bg-panel px-4 py-3 text-sm leading-6 text-ink-muted shadow-[var(--shadow-panel)]">
              <p className="font-medium text-foreground">Cart readiness</p>
              <p className="mt-1">
                {cart.hasUnavailableItems
                  ? "Some items need attention before checkout."
                  : "Your cart is ready for secure checkout review."}
              </p>
            </div>
          </div>
          {notice ? <AuthMessage tone="success" message={notice} /> : null}
          {error ? <AuthMessage tone="error" message={error} /> : null}
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-border bg-panel-muted px-4 py-3 text-sm text-ink-muted">
              <span>
                {cart.itemCount} item{cart.itemCount === 1 ? "" : "s"} in your cart
              </span>
              <span>Update quantities anytime before checkout.</span>
            </div>
            {cart.items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </section>

          <div className="xl:sticky xl:top-28 xl:self-start">
            <CartSummary cart={cart} />
          </div>
        </div>
      </Container>
    </div>
  );
}
