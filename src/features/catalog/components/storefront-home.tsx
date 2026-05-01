import Link from "next/link";
import { Container } from "@/components/ui/container";
import { CatalogEmptyState } from "@/features/catalog/components/catalog-empty-state";
import { ProductGrid } from "@/features/catalog/components/cards/product-grid";
import { ProductVisual } from "@/features/catalog/components/product-visual";
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
    .slice(0, 6);
};

const getSellerCount = (products: ProductSummary[]) =>
  new Set(
    products
      .map((product) => product.seller?.name)
      .filter((sellerName): sellerName is string => Boolean(sellerName)),
  ).size;

const getNewArrivals = (products: ProductSummary[]) =>
  products
    .slice()
    .sort((left, right) => {
      const leftTime = left.publishedAt ? Date.parse(left.publishedAt) : 0;
      const rightTime = right.publishedAt ? Date.parse(right.publishedAt) : 0;

      return rightTime - leftTime;
    })
    .slice(0, 3);

function HomeSearch({ categories }: { categories: CategoryHighlight[] }) {
  return (
    <section className="border-y border-border/70 bg-white/72 py-8">
      <Container className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase text-brand">
            Find your next upgrade
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            Search products or jump into a department.
          </h2>
        </div>

        <div className="space-y-3">
          <form action="/products" method="GET" className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor="home-product-search" className="sr-only">
              Search products
            </label>
            <input
              id="home-product-search"
              name="q"
              type="search"
              placeholder="Search desk gear, audio, accessories"
              className="h-12 min-w-0 flex-1 rounded-full border border-border bg-white px-5 text-sm text-foreground placeholder:text-ink-muted focus:border-brand focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-sm font-semibold text-white transition hover:bg-brand"
            >
              Search
            </button>
          </form>

          {categories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 5).map((category) => (
                <Link
                  key={category.slug}
                  href={`/products?category=${category.slug}`}
                  className="inline-flex min-h-9 items-center rounded-full border border-border bg-panel px-3 text-xs font-semibold text-foreground transition hover:border-brand hover:text-brand"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

export function StorefrontHome({ products }: StorefrontHomeProps) {
  const featuredProducts = products.slice(0, 6);
  const heroProducts = products.slice(0, 3);
  const categoryHighlights = getCategoryHighlights(products);
  const sellerCount = getSellerCount(products);
  const newArrivals = getNewArrivals(products);

  return (
    <>
      <section className="bg-foreground py-3 text-white">
        <Container className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center text-sm font-medium md:justify-between md:text-left">
          <span>Independent sellers. Secure checkout. Tracked orders.</span>
          <span className="text-white/72">
            Shop workspace, audio, and creator essentials in one marketplace.
          </span>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container className="grid gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(20rem,0.98fr)] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-brand/20 bg-white/78 px-4 py-2 text-sm font-semibold text-brand">
              Trusted sellers for better everyday setups
            </span>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
                Shop useful gear from independent marketplace sellers.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-ink-muted">
                Browse curated products for desks, studios, and daily work. Find
                what fits, add it to cart, and keep every order easy to track.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/products"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-foreground"
              >
                Shop all products
              </Link>
              <Link
                href="/sell"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-white/75 px-6 text-sm font-semibold text-foreground transition hover:border-foreground/25 hover:bg-white"
              >
                Start selling
              </Link>
            </div>

            <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-white/72 p-4">
                <p className="text-2xl font-semibold text-foreground">{products.length}</p>
                <p className="mt-1 text-sm text-ink-muted">Products to browse</p>
              </div>
              <div className="rounded-2xl border border-border bg-white/72 p-4">
                <p className="text-2xl font-semibold text-foreground">{sellerCount}</p>
                <p className="mt-1 text-sm text-ink-muted">Seller storefronts</p>
              </div>
              <div className="rounded-2xl border border-border bg-white/72 p-4">
                <p className="text-2xl font-semibold text-foreground">
                  {categoryHighlights.length}
                </p>
                <p className="mt-1 text-sm text-ink-muted">Departments</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {heroProducts.length > 0 ? (
              heroProducts.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className={index === 0 ? "sm:col-span-2" : ""}
                >
                  <ProductVisual
                    title={product.title}
                    imageUrl={product.thumbnailUrl}
                    className={index === 0 ? "h-72" : "h-44"}
                  />
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {product.title}
                      </p>
                      <p className="truncate text-sm text-ink-muted">
                        {product.category?.name ?? "Marketplace pick"}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-white/82 px-3 py-1 text-xs font-semibold text-brand">
                      View
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="sm:col-span-2">
                <ProductVisual title="Northstar Market" className="h-72" />
              </div>
            )}
          </div>
        </Container>
      </section>

      <HomeSearch categories={categoryHighlights} />

      <section id="categories" className="py-14 md:py-16">
        <Container className="space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase text-brand">
                Browse departments
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                Popular places to start
              </h2>
              <p className="max-w-3xl text-sm leading-7 text-ink-muted">
                Move quickly from broad browsing to products that match the way
                you work, listen, and create.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex min-h-11 w-fit items-center justify-center rounded-full border border-border bg-white/78 px-5 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
            >
              Browse all departments
            </Link>
          </div>

          {categoryHighlights.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {categoryHighlights.map((category, index) => (
                <Link
                  key={category.slug}
                  href={`/products?category=${category.slug}`}
                  className="group overflow-hidden rounded-2xl border border-border bg-white/78 shadow-[var(--shadow-panel)] transition hover:-translate-y-1 hover:border-foreground/20"
                >
                  <div className="h-24 bg-gradient-to-br from-sky-100 via-white to-emerald-100 p-5">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/78 text-lg font-semibold text-foreground shadow-sm">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="space-y-3 p-5">
                    <p className="text-sm font-semibold uppercase text-brand">
                      {category.name}
                    </p>
                    <p className="text-2xl font-semibold tracking-tight text-foreground">
                      {category.count} product{category.count === 1 ? "" : "s"}
                    </p>
                    <p className="text-sm leading-6 text-ink-muted">
                      Explore active listings from approved sellers in this department.
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <CatalogEmptyState />
          )}
        </Container>
      </section>

      <section id="featured" className="border-y border-border/70 bg-white/65 py-14 md:py-16">
        <Container className="space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase text-brand">
                Featured picks
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                Ready for your cart
              </h2>
              <p className="max-w-3xl text-sm leading-7 text-ink-muted">
                A focused shelf of active marketplace picks from trusted shops.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex min-h-11 w-fit items-center justify-center rounded-full bg-foreground px-5 text-sm font-semibold text-white transition hover:bg-brand"
            >
              View all products
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <ProductGrid products={featuredProducts} />
          ) : (
            <CatalogEmptyState />
          )}
        </Container>
      </section>

      <section id="new-arrivals" className="py-14 md:py-16">
        <Container className="space-y-8">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase text-brand">
              New arrivals
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              Recently added to the marketplace
            </h2>
          </div>

          {newArrivals.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {newArrivals.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="grid gap-4 rounded-2xl border border-border bg-white/78 p-4 shadow-[var(--shadow-panel)] transition hover:-translate-y-1 hover:border-foreground/20 sm:grid-cols-[9rem_minmax(0,1fr)] lg:grid-cols-1"
                >
                  <ProductVisual
                    title={product.title}
                    imageUrl={product.thumbnailUrl}
                    className="h-36"
                  />
                  <div className="min-w-0 space-y-2">
                    <p className="text-xs font-semibold uppercase text-brand">
                      {product.category?.name ?? "New arrival"}
                    </p>
                    <h3 className="line-clamp-2 text-lg font-semibold text-foreground">
                      {product.title}
                    </h3>
                    <p className="line-clamp-2 text-sm leading-6 text-ink-muted">
                      {product.shortDescription}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <CatalogEmptyState />
          )}
        </Container>
      </section>

      <section className="border-y border-border/70 bg-white/65 py-14 md:py-16">
        <Container className="grid gap-5 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase text-brand">
              Why shop here
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              Marketplace basics that make checkout feel clear.
            </h2>
            <p className="text-sm leading-7 text-ink-muted">
              Northstar keeps shopping, seller tools, and platform operations separate
              so each journey stays focused.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["Secure checkout", "Pay with a clear, guided checkout experience."],
              ["Trusted sellers", "Public products come from approved sellers only."],
              ["Tracked orders", "Customers can return to account order history after purchase."],
              ["Customer-first account", "Profiles, saved addresses, cart, and orders are easy to reach."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-border bg-white/78 p-5">
                <p className="text-lg font-semibold text-foreground">{title}</p>
                <p className="mt-2 text-sm leading-6 text-ink-muted">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-16">
        <Container>
          <div className="grid gap-6 rounded-2xl border border-border bg-foreground p-6 text-white shadow-[var(--shadow-panel)] md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-8">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase text-white/72">
                Sell on Northstar
              </p>
              <h2 className="text-3xl font-semibold tracking-tight">
                Bring your products to a focused marketplace.
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-white/72">
                Apply to sell, set up your store profile, and manage listings once
                your seller account is approved.
              </p>
            </div>
            <Link
              href="/sell"
              className="inline-flex min-h-12 w-fit items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-foreground transition hover:bg-brand-soft"
            >
              Start selling
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
