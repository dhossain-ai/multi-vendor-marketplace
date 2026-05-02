import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ProductGrid } from "@/features/catalog/components/cards/product-grid";
import {
  listPublicProducts,
  searchPublicProducts,
} from "@/features/catalog/lib/catalog-repository";
import type { ProductSummary } from "@/features/catalog/types";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse marketplace products by search, category, sort, and page.",
};

type ProductsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

type CategoryFilter = {
  name: string;
  slug: string;
  count: number;
};

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Relevance", value: "relevance" },
];

const MAX_QUERY_LENGTH = 80;
const MAX_PAGE = 50;
const PAGE_SIZE = 12;
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,79}$/;

const readSingleParam = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : undefined;

const normalizeSearchQuery = (value: string | undefined) => {
  const normalized = value?.replace(/\s+/g, " ").trim().slice(0, MAX_QUERY_LENGTH);

  return normalized || undefined;
};

const normalizeCategory = (value: string | undefined) => {
  const normalized = value?.trim().toLowerCase();

  return normalized && SLUG_PATTERN.test(normalized) ? normalized : undefined;
};

const normalizeSort = (value: string | undefined) =>
  value === "price_asc" ||
  value === "price_desc" ||
  value === "newest" ||
  value === "relevance"
    ? value
    : undefined;

const normalizePage = (value: string | undefined) => {
  const rawPage = value ? Number.parseInt(value, 10) : 1;

  if (!Number.isInteger(rawPage) || rawPage < 1) {
    return 1;
  }

  return Math.min(rawPage, MAX_PAGE);
};

const getCategoryFilters = (products: ProductSummary[]) => {
  const categoryMap = new Map<string, CategoryFilter>();

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

  return Array.from(categoryMap.values()).sort(
    (left, right) => right.count - left.count || left.name.localeCompare(right.name),
  );
};

const buildProductsHref = (input: {
  q?: string;
  category?: string;
  sort?: string;
  page?: number;
}) => {
  const params = new URLSearchParams();

  if (input.q) {
    params.set("q", input.q);
  }

  if (input.category) {
    params.set("category", input.category);
  }

  if (input.sort) {
    params.set("sort", input.sort);
  }

  if (input.page && input.page > 1) {
    params.set("page", String(input.page));
  }

  const query = params.toString();

  return query ? `/products?${query}` : "/products";
};

const formatCategoryLabel = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
    .join(" ");

function NoResultsPanel({
  q,
  categoryFilters,
}: {
  q?: string;
  categoryFilters: CategoryFilter[];
}) {
  return (
    <section className="rounded-2xl border border-dashed border-border bg-white/82 p-6 text-center shadow-[var(--shadow-panel)] md:p-10">
      <p className="text-sm font-semibold uppercase text-brand">
        No matching products found
      </p>
      <h2 className="mx-auto mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
        Try a different search or clear your filters.
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-ink-muted">
        {q
          ? `No active products matched "${q}". Check the spelling, try a broader term, or browse all products.`
          : "No active products match the selected department and sort combination right now."}
      </p>

      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/products"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-foreground px-5 text-sm font-semibold text-white transition hover:bg-brand focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/25"
        >
          Browse all products
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-white px-5 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/20"
        >
          Return to homepage
        </Link>
      </div>

      {categoryFilters.length > 0 ? (
        <div className="mt-7 border-t border-border pt-5">
          <p className="text-sm font-medium text-foreground">Browse departments</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {categoryFilters.slice(0, 5).map((item) => (
              <Link
                key={item.slug}
                href={`/products?category=${item.slug}`}
                className="inline-flex min-h-10 items-center rounded-full border border-border bg-white px-4 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/20"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  const q = normalizeSearchQuery(readSingleParam(params.q));
  const category = normalizeCategory(readSingleParam(params.category));
  const sort = normalizeSort(readSingleParam(params.sort));
  const page = normalizePage(readSingleParam(params.page));
  const selectedSort = sort ?? (q ? "relevance" : "newest");

  const [result, categorySource] = await Promise.all([
    searchPublicProducts({
      q,
      category,
      sort,
      page,
      pageSize: PAGE_SIZE,
    }),
    listPublicProducts(36),
  ]);

  const totalPages = Math.ceil(result.totalCount / result.pageSize);
  const categoryFilters = getCategoryFilters(categorySource.products);
  const activeCategoryLabel =
    categoryFilters.find((item) => item.slug === category)?.name ??
    (category ? formatCategoryLabel(category) : null);
  const activeSortLabel =
    SORT_OPTIONS.find((option) => option.value === selectedSort)?.label ?? "Newest";
  const startIndex =
    result.totalCount > 0 ? (result.page - 1) * result.pageSize + 1 : 0;
  const endIndex = Math.min(result.page * result.pageSize, result.totalCount);
  const hasActiveFilters = Boolean(q || category || sort);

  return (
    <div className="py-10 md:py-14">
      <Container className="space-y-8">
        <section className="overflow-hidden rounded-2xl border border-border bg-white/84 shadow-[var(--shadow-panel)]">
          <div className="grid gap-6 p-5 md:p-7 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start">
            <div className="space-y-5">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase text-brand">
                  Shop products
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                  {q
                    ? `Search results for "${q}"`
                    : activeCategoryLabel
                      ? `${activeCategoryLabel} products`
                      : "Browse the marketplace"}
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-ink-muted">
                  Search products, browse active departments, and sort the public
                  catalog by newest or price.
                </p>
              </div>

              <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(14rem,0.46fr)]">
                <form
                  action="/products"
                  method="GET"
                  className="rounded-2xl border border-border bg-panel-muted p-3"
                >
                  <label
                    className="mb-2 block text-xs font-semibold uppercase text-brand"
                    htmlFor="product-search"
                  >
                    Search products
                  </label>
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <input
                      id="product-search"
                      type="search"
                      name="q"
                      defaultValue={q}
                      placeholder="Search products, categories, sellers"
                      className="h-12 min-w-0 rounded-full border border-border bg-white px-5 text-sm text-foreground placeholder:text-ink-muted focus:border-brand focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/20"
                    />
                    {category ? (
                      <input type="hidden" name="category" value={category} />
                    ) : null}
                    {sort ? <input type="hidden" name="sort" value={sort} /> : null}
                    <button
                      type="submit"
                      className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-sm font-semibold text-white transition hover:bg-brand focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/25"
                    >
                      Search
                    </button>
                  </div>
                </form>

                <form
                  action="/products"
                  method="GET"
                  className="rounded-2xl border border-border bg-panel-muted p-3"
                >
                  <label
                    className="mb-2 block text-xs font-semibold uppercase text-brand"
                    htmlFor="product-sort"
                  >
                    Sort results
                  </label>
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] xl:grid-cols-1">
                    {q ? <input type="hidden" name="q" value={q} /> : null}
                    {category ? (
                      <input type="hidden" name="category" value={category} />
                    ) : null}
                    <select
                      id="product-sort"
                      name="sort"
                      defaultValue={selectedSort}
                      className="h-12 cursor-pointer rounded-full border border-border bg-white px-5 pr-10 text-sm text-foreground focus:border-brand focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/20"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-white px-5 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/20"
                    >
                      Apply
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <aside className="rounded-2xl border border-border bg-panel-muted p-5">
              <p className="text-sm font-semibold uppercase text-brand">
                Current results
              </p>
              <p className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
                {result.totalCount}
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                {result.totalCount === 1 ? "product" : "products"} found
              </p>
              {result.totalCount > 0 ? (
                <p className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-medium text-foreground">
                  Showing {startIndex}-{endIndex} of {result.totalCount}
                </p>
              ) : null}
              <dl className="mt-5 grid gap-3 text-sm">
                <div>
                  <dt className="text-ink-muted">Department</dt>
                  <dd className="font-semibold text-foreground">
                    {activeCategoryLabel ?? "All departments"}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Sort</dt>
                  <dd className="font-semibold text-foreground">{activeSortLabel}</dd>
                </div>
              </dl>
            </aside>
          </div>
        </section>

        {categoryFilters.length > 0 ? (
          <section className="rounded-2xl border border-border bg-white/72 p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Browse departments
                </h2>
                <p className="text-sm text-ink-muted">
                  Department counts reflect products visible in the public catalog.
                </p>
              </div>
              {category ? (
                <Link
                  href={buildProductsHref({ q, sort })}
                  className="inline-flex min-h-10 w-fit items-center justify-center rounded-full border border-border bg-white px-4 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/20"
                >
                  Clear department
                </Link>
              ) : null}
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
              <Link
                href={buildProductsHref({ q, sort })}
                className={
                  category
                    ? "inline-flex min-h-10 shrink-0 items-center rounded-full border border-border bg-white px-4 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/20"
                    : "inline-flex min-h-10 shrink-0 items-center rounded-full bg-brand px-4 text-sm font-semibold text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/25"
                }
              >
                All departments
              </Link>
              {categoryFilters.map((item) => (
                <Link
                  key={item.slug}
                  href={buildProductsHref({ q, category: item.slug, sort })}
                  className={
                    item.slug === category
                      ? "inline-flex min-h-10 shrink-0 items-center rounded-full bg-brand px-4 text-sm font-semibold text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/25"
                      : "inline-flex min-h-10 shrink-0 items-center rounded-full border border-border bg-white px-4 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/20"
                  }
                >
                  {item.name}
                  <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5 text-xs">
                    {item.count}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {hasActiveFilters ? (
          <section className="flex flex-col gap-3 rounded-2xl border border-border bg-white/72 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-ink-muted">
                Active filters
              </span>
              {q ? (
                <span className="inline-flex min-h-8 items-center rounded-full bg-white px-3 text-xs font-semibold text-foreground">
                  Search: {q}
                </span>
              ) : null}
              {activeCategoryLabel ? (
                <span className="inline-flex min-h-8 items-center rounded-full bg-white px-3 text-xs font-semibold text-foreground">
                  Department: {activeCategoryLabel}
                </span>
              ) : null}
              {sort ? (
                <span className="inline-flex min-h-8 items-center rounded-full bg-white px-3 text-xs font-semibold text-foreground">
                  Sort: {activeSortLabel}
                </span>
              ) : null}
            </div>
            <Link
              href="/products"
              className="inline-flex min-h-10 w-fit items-center justify-center rounded-full bg-foreground px-4 text-sm font-semibold text-white transition hover:bg-brand focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/25"
            >
              Clear all filters
            </Link>
          </section>
        ) : null}

        {result.products.length > 0 ? (
          <>
            <section className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    Product results
                  </h2>
                  <p className="text-sm text-ink-muted">
                    {result.totalCount === 1
                      ? "One active product matches your browse settings."
                      : `${result.totalCount} active products match your browse settings.`}
                  </p>
                </div>
                <Link
                  href="/products"
                  className="inline-flex min-h-10 w-fit items-center justify-center rounded-full border border-border bg-white/78 px-4 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/20"
                >
                  Reset browse
                </Link>
              </div>
              <ProductGrid products={result.products} />
            </section>

            {totalPages > 1 ? (
              <nav
                aria-label="Product pagination"
                className="mt-12 rounded-2xl border border-border bg-white/76 p-4 shadow-sm"
              >
                <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                  {page > 1 ? (
                    <Link
                      href={buildProductsHref({
                        q,
                        category,
                        sort,
                        page: page - 1,
                      })}
                      className="inline-flex h-11 w-full items-center justify-center rounded-full border border-border bg-white px-4 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/20 sm:w-auto sm:min-w-32"
                    >
                      Previous
                    </Link>
                  ) : (
                    <span className="inline-flex h-11 w-full items-center justify-center rounded-full border border-border bg-white/60 px-4 text-sm font-semibold text-ink-muted opacity-60 sm:w-auto sm:min-w-32">
                      Previous
                    </span>
                  )}

                  <span className="text-center text-sm font-semibold text-foreground">
                    Page {page} of {totalPages}
                  </span>

                  {page < totalPages ? (
                    <Link
                      href={buildProductsHref({
                        q,
                        category,
                        sort,
                        page: page + 1,
                      })}
                      className="inline-flex h-11 w-full items-center justify-center rounded-full border border-border bg-white px-4 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/20 sm:w-auto sm:min-w-32"
                    >
                      Next
                    </Link>
                  ) : (
                    <span className="inline-flex h-11 w-full items-center justify-center rounded-full border border-border bg-white/60 px-4 text-sm font-semibold text-ink-muted opacity-60 sm:w-auto sm:min-w-32">
                      Next
                    </span>
                  )}
                </div>
              </nav>
            ) : null}
          </>
        ) : (
          <NoResultsPanel q={q} categoryFilters={categoryFilters} />
        )}
      </Container>
    </div>
  );
}
