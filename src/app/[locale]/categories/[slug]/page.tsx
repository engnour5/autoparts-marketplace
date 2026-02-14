import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/products/ProductGrid";

export default async function CategoryPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  const isAr = locale === "ar";

  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) notFound();

  const products = await prisma.product.findMany({
    where: {
      categoryId: category.id,
      isAvailable: true,
    },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      seller: {
        select: {
          id: true,
          name: true,
          sellerProfile: {
            select: { shopName: true, shopNameAr: true, isVerified: true },
          },
        },
      },
    },
  });

  const displayName =
    isAr && category.nameAr ? category.nameAr : category.name;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{displayName}</h1>
      <ProductGrid products={products} />
    </div>
  );
}
