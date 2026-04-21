import type { Metadata } from "next";
import { readSearchParam } from "@/lib/auth/navigation";
import { AdminProductsView } from "@/features/admin/components/admin-products-view";
import { getAdminProducts } from "@/features/admin/lib/admin-product-repository";
import type { AdminProductStatus } from "@/features/admin/types";

type AdminProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const isProductStatus = (value: string | null): value is AdminProductStatus =>
  value === "draft" ||
  value === "active" ||
  value === "archived" ||
  value === "suspended";

export const metadata: Metadata = {
  title: "Admin Products",
  description: "Moderate products across the marketplace.",
};

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const search = await searchParams;
  const statusParam = readSearchParam(search.status);
  const status = isProductStatus(statusParam) ? statusParam : null;
  const products = await getAdminProducts(status);

  return (
    <AdminProductsView
      products={products}
      currentStatus={status}
      notice={readSearchParam(search.notice)}
      error={readSearchParam(search.error)}
    />
  );
}
