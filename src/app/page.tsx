import { StorefrontHome } from "@/features/catalog/components/storefront-home";
import { listPublicProducts } from "@/features/catalog/lib/catalog-repository";

export default async function Home() {
  const catalog = await listPublicProducts();

  return <StorefrontHome products={catalog.products} />;
}
