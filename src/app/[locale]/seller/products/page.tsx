import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Package } from "lucide-react";
import DeleteProductButton from "@/components/products/DeleteProductButton";

export default async function SellerProductsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SELLER") {
    redirect(`/${locale}/auth/login`);
  }

  const t = await getTranslations();

  const products = await prisma.product.findMany({
    where: { sellerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t("products.manageProducts")}</h1>
        <Link href={`/${locale}/seller/products/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t("products.addProduct")}
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t("products.noProducts")}</p>
          <Link href={`/${locale}/seller/products/new`}>
            <Button className="mt-4">{t("products.addProduct")}</Button>
          </Link>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>{t("products.productName")}</TableHead>
                <TableHead>{t("products.category")}</TableHead>
                <TableHead>{t("common.price")}</TableHead>
                <TableHead>{t("products.stock")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const productImages = parseImages(product.images);
                return (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="w-10 h-10 relative rounded overflow-hidden bg-muted">
                      {productImages.length > 0 ? (
                        <Image
                          src={productImages[0]}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category.name}</TableCell>
                  <TableCell>
                    {product.price.toLocaleString()} {t("common.currency")}
                  </TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    {product.isAvailable ? (
                      <Badge>{t("products.available")}</Badge>
                    ) : (
                      <Badge variant="destructive">
                        {t("products.outOfStock")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link
                        href={`/${locale}/seller/products/${product.id}/edit`}
                      >
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DeleteProductButton productId={product.id} />
                    </div>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
