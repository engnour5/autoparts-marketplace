import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DeleteProductButton from "@/components/products/DeleteProductButton";

export default async function AdminProductsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect(`/${locale}/auth/login`);
  }

  const t = await getTranslations();

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      seller: {
        select: {
          name: true,
          sellerProfile: { select: { shopName: true } },
        },
      },
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t("admin.manageProducts")}</h1>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("products.productName")}</TableHead>
              <TableHead>{t("common.seller")}</TableHead>
              <TableHead>{t("products.category")}</TableHead>
              <TableHead>{t("common.price")}</TableHead>
              <TableHead>{t("products.stock")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead>{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  {product.seller.sellerProfile?.shopName || product.seller.name}
                </TableCell>
                <TableCell>{product.category.name}</TableCell>
                <TableCell>
                  {product.price.toLocaleString()} {t("common.currency")}
                </TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <Badge variant={product.isAvailable ? "default" : "destructive"}>
                    {product.isAvailable
                      ? t("products.available")
                      : t("products.outOfStock")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DeleteProductButton productId={product.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
