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
                Customer cart
              </p>
              <h1 className="text-foreground mt-2 text-4xl font-semibold tracking-tight">
                Authenticated cart foundation
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
              Customer cart
            </p>
            <h1 className="text-foreground text-4xl font-semibold tracking-tight">
              Review your selected items
            </h1>
            <p className="text-ink-muted max-w-3xl text-sm leading-7">
              Cart reads and writes are now server-scoped to the authenticated
              user. Checkout now revalidates the latest cart state on the server
              before creating a pending order.
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
