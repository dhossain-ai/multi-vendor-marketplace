import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ProductGrid } from "@/features/catalog/components/cards/product-grid";
import { searchPublicProducts } from "@/features/catalog/lib/catalog-repository";
import { CatalogEmptyState } from "@/features/catalog/components/catalog-empty-state";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse our complete catalog of products.",
};

type ProductsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Relevance", value: "relevance" },
];

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  const q = typeof params.q === "string" ? params.q : undefined;
  const category = typeof params.category === "string" ? params.category : undefined;
  
  const rawSort = typeof params.sort === "string" ? params.sort : undefined;
  const sort =
    rawSort === "price_asc" || rawSort === "price_desc" || rawSort === "newest" || rawSort === "relevance"
      ? rawSort
      : undefined;

  const rawPage = typeof params.page === "string" ? parseInt(params.page, 10) : 1;
  const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1;

  const result = await searchPublicProducts({
    q,
    category,
    sort,
    page,
    pageSize: 12,
  });

  const totalPages = Math.ceil(result.totalCount / result.pageSize);

  return (
    <div className="py-12 md:py-16">
      <Container className="space-y-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {q ? `Search results for "${q}"` : category ? `Products in ${category}` : "All Products"}
            </h1>
            <p className="mt-2 text-ink-muted">
              {result.totalCount} {result.totalCount === 1 ? "product" : "products"} found.
            </p>
          </div>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Minimal Search form */}
            <form action="/products" method="GET" className="flex items-center gap-2">
              <input 
                type="text" 
                name="q" 
                defaultValue={q} 
                placeholder="Search products..."
                className="h-10 rounded-full border border-border bg-panel px-4 text-sm text-foreground placeholder-ink-muted focus:border-brand focus:outline-none"
              />
              {category && <input type="hidden" name="category" value={category} />}
              {sort && <input type="hidden" name="sort" value={sort} />}
              <button 
                type="submit" 
                className="h-10 rounded-full bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
              >
                Search
              </button>
            </form>

            <form action="/products" method="GET" className="flex items-center gap-2">
              {q && <input type="hidden" name="q" value={q} />}
              {category && <input type="hidden" name="category" value={category} />}
              <select 
                name="sort" 
                defaultValue={sort ?? (q ? "relevance" : "newest")}
                onChange={(e) => e.target.form?.submit()}
                className="h-10 cursor-pointer rounded-full border border-border bg-panel px-4 pr-10 text-sm text-foreground focus:border-brand focus:outline-none"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </form>
          </div>
        </div>

        {/* Clear filters button if filtering */}
        {(q || category || sort) && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-ink-muted">Active filters:</span>
            {q && (
              <span className="inline-flex items-center gap-1 rounded-full bg-panel-muted px-3 py-1 text-xs font-medium text-foreground">
                Query: {q}
              </span>
            )}
            {category && (
              <span className="inline-flex items-center gap-1 rounded-full bg-panel-muted px-3 py-1 text-xs font-medium text-foreground">
                Category: {category}
              </span>
            )}
            {sort && (
              <span className="inline-flex items-center gap-1 rounded-full bg-panel-muted px-3 py-1 text-xs font-medium text-foreground">
                Sort: {SORT_OPTIONS.find(o => o.value === sort)?.label}
              </span>
            )}
            <Link 
              href="/products"
              className="ml-2 text-sm text-brand hover:underline"
            >
              Clear all
            </Link>
          </div>
        )}

        {result.products.length > 0 ? (
          <>
            <ProductGrid products={result.products} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2 border-t border-border pt-8">
                {page > 1 ? (
                  <Link
                    href={`/products?${new URLSearchParams({
                      ...(q ? { q } : {}),
                      ...(category ? { category } : {}),
                      ...(sort ? { sort } : {}),
                      page: String(page - 1),
                    }).toString()}`}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-panel px-4 text-sm font-medium text-foreground transition-colors hover:bg-panel-muted"
                  >
                    Previous
                  </Link>
                ) : (
                  <span className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-panel px-4 text-sm font-medium text-ink-muted opacity-50">
                    Previous
                  </span>
                )}
                
                <span className="text-sm font-medium text-foreground">
                  Page {page} of {totalPages}
                </span>

                {page < totalPages ? (
                  <Link
                    href={`/products?${new URLSearchParams({
                      ...(q ? { q } : {}),
                      ...(category ? { category } : {}),
                      ...(sort ? { sort } : {}),
                      page: String(page + 1),
                    }).toString()}`}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-panel px-4 text-sm font-medium text-foreground transition-colors hover:bg-panel-muted"
                  >
                    Next
                  </Link>
                ) : (
                  <span className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-panel px-4 text-sm font-medium text-ink-muted opacity-50">
                    Next
                  </span>
                )}
              </div>
            )}
          </>
        ) : (
          <CatalogEmptyState />
        )}
      </Container>
    </div>
  );
}
