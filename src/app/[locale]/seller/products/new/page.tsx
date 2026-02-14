import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import ProductForm from "@/components/products/ProductForm";

export default async function NewProductPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SELLER") {
    redirect(`/${locale}/auth/login`);
  }

  const t = await getTranslations();
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t("products.addProduct")}</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
