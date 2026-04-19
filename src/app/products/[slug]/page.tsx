import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/features/catalog/components/detail/product-detail-view";
import {
  getPublicProductBySlug,
  listPublicProductSlugs,
  listRelatedProducts,
} from "@/features/catalog/lib/catalog-repository";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const result = await listPublicProductSlugs();

  return result.slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await getPublicProductBySlug(slug);

  if (!product) {
    return {
      title: "Product not found",
    };
  }

  return {
    title: product.title,
    description: product.shortDescription,
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const productResult = await getPublicProductBySlug(slug);

  if (!productResult.product) {
    notFound();
  }

  const relatedProductsResult = await listRelatedProducts(
    productResult.product.id,
    productResult.product.category?.slug,
  );

  return (
    <ProductDetailView
      product={productResult.product}
      relatedProducts={relatedProductsResult.products}
    />
  );
}
