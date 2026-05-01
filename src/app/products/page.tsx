import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { CatalogEmptyState } from "@/features/catalog/components/catalog-empty-state";
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
      pageSize: 12,
    }),
    listPublicProducts(36),
  ]);

  const totalPages = Math.ceil(result.totalCount / result.pageSize);
  const categoryFilters = getCategoryFilters(categorySource.products);
  const activeCategoryLabel =
    categoryFilters.find((item) => item.slug === category)?.name ??
    (category ? formatCategoryLabel(category) : null);
  const startIndex =
    result.totalCount > 0 ? (result.page - 1) * result.pageSize + 1 : 0;
  const endIndex = Math.min(result.page * result.pageSize, result.totalCount);

  return (
    <div className="py-10 md:py-14">
      <Container className="space-y-8">
        <section className="rounded-2xl border border-border bg-white/78 p-5 shadow-[var(--shadow-panel)] md:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
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
                Search active listings, browse departments, and sort products
                without leaving the storefront.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-panel-muted px-4 py-3 text-sm text-ink-muted">
              <span className="font-semibold text-foreground">
                {result.totalCount}
              </span>{" "}
              {result.totalCount === 1 ? "product" : "products"}
              {result.totalCount > 0 ? (
                <span>
                  {" "}
                  - showing {startIndex}-{endIndex}
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-6 grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto]">
            <form action="/products" method="GET" className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <label className="sr-only" htmlFor="product-search">
                Search products
              </label>
              <input
                id="product-search"
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Search products, categories, sellers"
                className="h-12 min-w-0 rounded-full border border-border bg-white px-5 text-sm text-foreground placeholder:text-ink-muted focus:border-brand focus:outline-none"
              />
              {category ? <input type="hidden" name="category" value={category} /> : null}
              {sort ? <input type="hidden" name="sort" value={sort} /> : null}
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-sm font-semibold text-white transition hover:bg-brand"
              >
                Search
              </button>
            </form>

            <form action="/products" method="GET" className="grid gap-2 sm:grid-cols-[minmax(11rem,1fr)_auto]">
              {q ? <input type="hidden" name="q" value={q} /> : null}
              {category ? <input type="hidden" name="category" value={category} /> : null}
              <label className="sr-only" htmlFor="product-sort">
                Sort products
              </label>
              <select
                id="product-sort"
                name="sort"
                defaultValue={selectedSort}
                className="h-12 cursor-pointer rounded-full border border-border bg-white px-5 pr-10 text-sm text-foreground focus:border-brand focus:outline-none"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-white px-5 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
              >
                Apply
              </button>
            </form>
          </div>
        </section>

        {categoryFilters.length > 0 ? (
          <section className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={buildProductsHref({ q, sort })}
                className={
                  category
                    ? "inline-flex min-h-10 items-center rounded-full border border-border bg-white/78 px-4 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
                    : "inline-flex min-h-10 items-center rounded-full bg-brand px-4 text-sm font-semibold text-white"
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
                      ? "inline-flex min-h-10 items-center rounded-full bg-brand px-4 text-sm font-semibold text-white"
                      : "inline-flex min-h-10 items-center rounded-full border border-border bg-white/78 px-4 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
                  }
                >
                  {item.name}
                  <span className="ml-2 text-xs opacity-75">{item.count}</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {(q || category || sort) ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-ink-muted">Active filters:</span>
            {q ? (
              <span className="inline-flex items-center rounded-full bg-white/78 px-3 py-1 text-xs font-semibold text-foreground">
                Search: {q}
              </span>
            ) : null}
            {activeCategoryLabel ? (
              <span className="inline-flex items-center rounded-full bg-white/78 px-3 py-1 text-xs font-semibold text-foreground">
                Department: {activeCategoryLabel}
              </span>
            ) : null}
            {sort && sort !== (q ? "relevance" : "newest") ? (
              <span className="inline-flex items-center rounded-full bg-white/78 px-3 py-1 text-xs font-semibold text-foreground">
                Sort: {SORT_OPTIONS.find((option) => option.value === sort)?.label}
              </span>
            ) : null}
            <Link href="/products" className="text-sm font-semibold text-brand hover:underline">
              Clear all
            </Link>
          </div>
        ) : null}

        {result.products.length > 0 ? (
          <>
            <ProductGrid products={result.products} />

            {totalPages > 1 ? (
              <div className="mt-12 flex flex-col items-center justify-center gap-3 border-t border-border pt-8 sm:flex-row">
                {page > 1 ? (
                  <Link
                    href={buildProductsHref({
                      q,
                      category,
                      sort,
                      page: page - 1,
                    })}
                    className="inline-flex h-11 min-w-32 items-center justify-center rounded-full border border-border bg-white/78 px-4 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
                  >
                    Previous
                  </Link>
                ) : (
                  <span className="inline-flex h-11 min-w-32 items-center justify-center rounded-full border border-border bg-white/60 px-4 text-sm font-semibold text-ink-muted opacity-60">
                    Previous
                  </span>
                )}

                <span className="min-w-28 text-center text-sm font-semibold text-foreground">
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
                    className="inline-flex h-11 min-w-32 items-center justify-center rounded-full border border-border bg-white/78 px-4 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
                  >
                    Next
                  </Link>
                ) : (
                  <span className="inline-flex h-11 min-w-32 items-center justify-center rounded-full border border-border bg-white/60 px-4 text-sm font-semibold text-ink-muted opacity-60">
                    Next
                  </span>
                )}
              </div>
            ) : null}
          </>
        ) : (
          <div className="space-y-4">
            <CatalogEmptyState />
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/products"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-foreground px-5 text-sm font-semibold text-white transition hover:bg-brand"
              >
                Browse all products
              </Link>
              {categoryFilters[0] ? (
                <Link
                  href={`/products?category=${categoryFilters[0].slug}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-white/78 px-5 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
                >
                  Try {categoryFilters[0].name}
                </Link>
              ) : null}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
