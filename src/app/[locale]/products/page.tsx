import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/products/ProductGrid";
import ProductFilter from "@/components/products/ProductFilter";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ProductsPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { search?: string; category?: string; sort?: string; page?: string; carMake?: string };
}) {
  const t = await getTranslations();
  const page = parseInt(searchParams.page || "1");
  const limit = 12;

  const where: Record<string, unknown> = { isAvailable: true };

  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: "insensitive" } },
      { nameAr: { contains: searchParams.search, mode: "insensitive" } },
      { description: { contains: searchParams.search, mode: "insensitive" } },
      { carMake: { contains: searchParams.search, mode: "insensitive" } },
      { carModel: { contains: searchParams.search, mode: "insensitive" } },
    ];
  }

  if (searchParams.category) {
    where.category = { slug: searchParams.category };
  }

  if (searchParams.carMake) {
    where.carMake = { contains: searchParams.carMake, mode: "insensitive" };
  }

  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (searchParams.sort === "price_asc") orderBy = { price: "asc" };
  if (searchParams.sort === "price_desc") orderBy = { price: "desc" };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
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
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t("products.title")}</h1>

      <ProductFilter categories={categories} />

      <ProductGrid products={products} />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <Link
              href={`/${locale}/products?${new URLSearchParams({
                ...searchParams,
                page: String(page - 1),
              }).toString()}`}
            >
              <Button variant="outline">&larr;</Button>
            </Link>
          )}
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/${locale}/products?${new URLSearchParams({
                ...searchParams,
                page: String(page + 1),
              }).toString()}`}
            >
              <Button variant="outline">&rarr;</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
