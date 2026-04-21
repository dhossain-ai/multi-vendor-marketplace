import { AuthMessage } from "@/features/auth/components/auth-message";
import { AdminActionButton } from "@/features/admin/components/admin-action-button";
import { AdminStatusBadge } from "@/features/admin/components/admin-status-badge";
import {
  archiveCategoryAction,
  createCategoryAction,
  updateCategoryAction,
} from "@/features/admin/lib/admin-actions";
import type { AdminCategory } from "@/features/admin/types";

type AdminCategoriesViewProps = {
  categories: AdminCategory[];
  notice?: string | null;
  error?: string | null;
};

export function AdminCategoriesView({
  categories,
  notice,
  error,
}: AdminCategoriesViewProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold tracking-[0.16em] text-brand uppercase">
          Category management
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          Categories
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-ink-muted">
          Keep storefront navigation organized without deleting history. Archived categories
          are hidden from future use while existing references stay intact.
        </p>
      </div>

      {error ? <AuthMessage tone="error" message={error} /> : null}
      {notice && !error ? <AuthMessage tone="success" message={notice} /> : null}

      <section className="rounded-[2rem] border border-border bg-panel p-6 shadow-[var(--shadow-panel)]">
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Create category
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Active categories become available to sellers right away.
            </p>
          </div>

          <form action={createCategoryAction} className="grid gap-4 lg:grid-cols-5">
            <div className="space-y-2 lg:col-span-2">
              <label htmlFor="create-name" className="text-sm font-medium text-foreground">
                Name
              </label>
              <input
                id="create-name"
                name="name"
                required
                minLength={2}
                className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                placeholder="Accessories"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="create-slug" className="text-sm font-medium text-foreground">
                Slug
              </label>
              <input
                id="create-slug"
                name="slug"
                required
                minLength={2}
                className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                placeholder="accessories"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="create-parent" className="text-sm font-medium text-foreground">
                Parent
              </label>
              <select
                id="create-parent"
                name="parentId"
                defaultValue=""
                className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
              >
                <option value="">No parent</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="create-sortOrder" className="text-sm font-medium text-foreground">
                Sort order
              </label>
              <input
                id="create-sortOrder"
                name="sortOrder"
                type="number"
                defaultValue={0}
                className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
              />
            </div>
            <label className="flex items-center gap-3 text-sm font-medium text-foreground lg:col-span-5">
              <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4 rounded" />
              Active category
            </label>
            <div className="lg:col-span-5">
              <AdminActionButton
                idleLabel="Create category"
                pendingLabel="Creating..."
                tone="primary"
              />
            </div>
          </form>
        </div>
      </section>

      <div className="space-y-3">
        {categories.map((category) => (
          <article
            key={category.id}
            className="rounded-[1.75rem] border border-border bg-panel p-5 shadow-[var(--shadow-panel)]"
          >
            <form action={updateCategoryAction} className="space-y-4">
              <input type="hidden" name="categoryId" value={category.id} />
              <div className="flex flex-wrap items-center gap-2">
                <AdminStatusBadge label={category.isActive ? "active" : "inactive"} />
                {category.parentName ? (
                  <span className="text-xs text-ink-muted">
                    Parent: {category.parentName}
                  </span>
                ) : null}
                <span className="text-xs text-ink-muted">
                  {category.activeProductCount} active products
                </span>
              </div>

              <div className="grid gap-4 lg:grid-cols-5">
                <div className="space-y-2 lg:col-span-2">
                  <label className="text-sm font-medium text-foreground">Name</label>
                  <input
                    name="name"
                    required
                    minLength={2}
                    defaultValue={category.name}
                    className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Slug</label>
                  <input
                    name="slug"
                    required
                    minLength={2}
                    defaultValue={category.slug}
                    className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Parent</label>
                  <select
                    name="parentId"
                    defaultValue={category.parentId ?? ""}
                    className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                  >
                    <option value="">No parent</option>
                    {categories
                      .filter((option) => option.id !== category.id)
                      .map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Sort order</label>
                  <input
                    name="sortOrder"
                    type="number"
                    defaultValue={category.sortOrder}
                    className="block w-full rounded-xl border border-border bg-panel-muted px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-3 text-sm font-medium text-foreground">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={category.isActive}
                    className="h-4 w-4 rounded"
                  />
                  Active
                </label>
                <AdminActionButton
                  idleLabel="Save category"
                  pendingLabel="Saving..."
                  tone="secondary"
                />
              </div>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
              <span>Total products: {category.totalProductCount}</span>
              <span>Updated: {new Date(category.updatedAt).toLocaleString()}</span>
              {category.isActive ? (
                <form action={archiveCategoryAction}>
                  <input type="hidden" name="categoryId" value={category.id} />
                  <AdminActionButton
                    idleLabel="Archive category"
                    pendingLabel="Archiving..."
                    tone="danger"
                  />
                </form>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
