import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";
import { redirect, notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import ProductForm from "@/components/products/ProductForm";

export default async function EditProductPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SELLER") {
    redirect(`/${locale}/auth/login`);
  }

  const t = await getTranslations();

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product || product.sellerId !== session.user.id) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t("products.editProduct")}</h1>
      <ProductForm
        product={{
          id: product.id,
          name: product.name,
          nameAr: product.nameAr || undefined,
          description: product.description || undefined,
          descriptionAr: product.descriptionAr || undefined,
          price: product.price,
          stock: product.stock,
          categoryId: product.categoryId,
          carMake: product.carMake || undefined,
          carModel: product.carModel || undefined,
          carYear: product.carYear || undefined,
          images: parseImages(product.images),
          isAvailable: product.isAvailable,
        }}
        categories={categories}
      />
    </div>
  );
}
