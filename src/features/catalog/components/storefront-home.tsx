import Link from "next/link";
import { Container } from "@/components/ui/container";
import { CatalogEmptyState } from "@/features/catalog/components/catalog-empty-state";
import { ProductGrid } from "@/features/catalog/components/cards/product-grid";
import type { ProductSummary } from "@/features/catalog/types";

type StorefrontHomeProps = {
  products: ProductSummary[];
};

type CategoryHighlight = {
  name: string;
  slug: string;
  count: number;
};

const getCategoryHighlights = (products: ProductSummary[]): CategoryHighlight[] => {
  const categoryMap = new Map<string, CategoryHighlight>();

  for (const product of products) {
    if (!product.category) {
      continue;
    }

    const current = categoryMap.get(product.category.slug);

    categoryMap.set(product.category.slug, {
      name: product.category.name,
      slug: product.category.slug,
      count: (current?.count ?? 0) + 1,
    });
  }

  return Array.from(categoryMap.values())
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))
    .slice(0, 4);
};

const getSellerCount = (products: ProductSummary[]) =>
  new Set(
    products
      .map((product) => product.seller?.name)
      .filter((sellerName): sellerName is string => Boolean(sellerName)),
  ).size;

export function StorefrontHome({ products }: StorefrontHomeProps) {
  const featuredProducts = products.slice(0, 6);
  const categoryHighlights = getCategoryHighlights(products);
  const sellerCount = getSellerCount(products);

  return (
    <>
      <section className="py-14 md:py-20">
        <Container className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-brand/20 bg-brand-soft px-4 py-2 text-sm font-medium text-brand">
              Independent sellers. Everyday setup upgrades.
            </span>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
                Discover workspace, audio, and creator gear from trusted shops.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-ink-muted">
                Shop curated essentials for your desk, studio, and daily workflow.
                Browse real products, add them to your cart, and check out
                securely when you&apos;re ready.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/products"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-white"
              >
                Shop all products
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-panel px-5 text-sm font-medium text-foreground"
              >
                Create your account
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-panel-muted p-6 shadow-[var(--shadow-panel)]">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
              This week at a glance
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white/85 p-5">
                <p className="text-sm text-ink-muted">Products ready to shop</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">
                  {products.length}
                </p>
              </div>
              <div className="rounded-3xl bg-white/85 p-5">
                <p className="text-sm text-ink-muted">Active seller storefronts</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">
                  {sellerCount}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 rounded-3xl bg-white/75 p-5">
              <p className="text-sm font-medium text-foreground">
                Shop with confidence
              </p>
              <ul className="space-y-2 text-sm leading-6 text-ink-muted">
                <li>Secure checkout powered by Stripe.</li>
                <li>Order history stays available in your account after purchase.</li>
                <li>Seller and admin tools stay separate from the customer journey.</li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section id="categories" className="border-border/70 border-y bg-white/65 py-14">
        <Container className="space-y-8">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
              Browse by category
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              Popular departments
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-ink-muted">
              Start with the categories customers reach for most often across the
              marketplace.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {categoryHighlights.map((category) => (
              <Link
                key={category.slug}
                href={`/products?category=${category.slug}`}
                className="rounded-[1.75rem] border border-border bg-panel p-6 shadow-[var(--shadow-panel)]"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brand">
                  {category.name}
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                  {category.count} product{category.count === 1 ? "" : "s"}
                </p>
                <p className="mt-2 text-sm text-ink-muted">
                  Fresh picks from independent sellers in {category.name.toLowerCase()}.
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section id="featured" className="py-16">
        <Container className="space-y-8">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
              Featured picks
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              Ready to add to your setup
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-ink-muted">
              A focused selection of bestsellers, new arrivals, and daily-use essentials.
            </p>
          </div>

          {featuredProducts.length > 0 ? (
            <ProductGrid products={featuredProducts} />
          ) : (
            <CatalogEmptyState />
          )}
        </Container>
      </section>

      <section className="border-border/70 border-t bg-white/60 py-16">
        <Container className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-border bg-panel p-8 shadow-[var(--shadow-panel)]">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
              Why shoppers stay
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
              A marketplace built for clear buying journeys
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-muted">
              Customers get a clean storefront, sellers get focused store tools,
              and admins get platform controls without cluttering the shopping experience.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.75rem] border border-border bg-panel p-6 shadow-[var(--shadow-panel)]">
              <p className="text-lg font-semibold text-foreground">Customer-first</p>
              <p className="mt-2 text-sm leading-7 text-ink-muted">
                Browse products, check out quickly, and keep your order history in one place.
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-border bg-panel p-6 shadow-[var(--shadow-panel)]">
              <p className="text-lg font-semibold text-foreground">Trusted seller tools</p>
              <p className="mt-2 text-sm leading-7 text-ink-muted">
                Approved sellers manage listings and sales without stepping into admin controls.
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-border bg-panel p-6 shadow-[var(--shadow-panel)]">
              <p className="text-lg font-semibold text-foreground">Operational clarity</p>
              <p className="mt-2 text-sm leading-7 text-ink-muted">
                Admins can moderate sellers, products, orders, categories, and coupons separately.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
