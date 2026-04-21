import type { Metadata } from "next";
import { readSearchParam } from "@/lib/auth/navigation";
import { AdminCategoriesView } from "@/features/admin/components/admin-categories-view";
import { getAdminCategories } from "@/features/admin/lib/admin-category-repository";

type AdminCategoriesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Admin Categories",
  description: "Manage marketplace categories.",
};

export default async function AdminCategoriesPage({
  searchParams,
}: AdminCategoriesPageProps) {
  const search = await searchParams;
  const categories = await getAdminCategories();

  return (
    <AdminCategoriesView
      categories={categories}
      notice={readSearchParam(search.notice)}
      error={readSearchParam(search.error)}
    />
  );
}
