import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Package, MapPin, Phone, MessageSquare, CheckCircle, Store } from "lucide-react";
import ProductGrid from "@/components/products/ProductGrid";

export default async function ProductDetailPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  const t = await getTranslations();
  const isAr = locale === "ar";

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      seller: {
        select: {
          id: true,
          name: true,
          phone: true,
          city: true,
          sellerProfile: true,
        },
      },
    },
  });

  if (!product) notFound();

  const images = parseImages(product.images);

  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isAvailable: true,
    },
    take: 4,
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

  const displayName = isAr && product.nameAr ? product.nameAr : product.name;
  const displayDesc =
    isAr && product.descriptionAr
      ? product.descriptionAr
      : product.description;
  const shopName =
    isAr && product.seller.sellerProfile?.shopNameAr
      ? product.seller.sellerProfile.shopNameAr
      : product.seller.sellerProfile?.shopName || product.seller.name;
  const categoryName =
    isAr && product.category.nameAr
      ? product.category.nameAr
      : product.category.name;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
            {images.length > 0 ? (
              <Image
                src={images[0]}
                alt={displayName}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(1).map((img, i) => (
                <div
                  key={i}
                  className="aspect-square relative rounded-md overflow-hidden border"
                >
                  <Image
                    src={img}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <Badge variant="secondary" className="mb-2">
            {categoryName}
          </Badge>
          <h1 className="text-3xl font-bold mb-2">{displayName}</h1>

          {product.carMake && (
            <p className="text-muted-foreground mb-4">
              {product.carMake}
              {product.carModel ? ` ${product.carModel}` : ""}
              {product.carYear ? ` (${product.carYear})` : ""}
            </p>
          )}

          <div className="text-3xl font-bold text-primary mb-4">
            {product.price.toLocaleString()} {t("common.currency")}
          </div>

          <div className="mb-4">
            {product.isAvailable && product.stock > 0 ? (
              <Badge variant="default">{t("products.available")} ({product.stock})</Badge>
            ) : (
              <Badge variant="destructive">{t("products.outOfStock")}</Badge>
            )}
          </div>

          {displayDesc && (
            <>
              <Separator className="my-4" />
              <div>
                <h2 className="font-semibold mb-2">{t("products.description")}</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {displayDesc}
                </p>
              </div>
            </>
          )}

          <Separator className="my-4" />

          {/* Order & Contact */}
          <div className="flex gap-3 mb-6">
            <Link href={`/${locale}/customer/orders?product=${product.id}`} className="flex-1">
              <Button className="w-full" size="lg" disabled={!product.isAvailable}>
                {t("products.addToOrder")}
              </Button>
            </Link>
            <Link href={`/${locale}/messages?to=${product.seller.id}`}>
              <Button variant="outline" size="lg">
                <MessageSquare className="h-4 w-4 mr-2" />
                {t("products.contactSeller")}
              </Button>
            </Link>
          </div>

          {/* Seller info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Store className="h-5 w-5" />
                {t("products.sellerInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{shopName}</span>
                {product.seller.sellerProfile?.isVerified && (
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                )}
              </div>
              {product.seller.city && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {product.seller.city}
                </div>
              )}
              {product.seller.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {product.seller.phone}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">
            {t("products.relatedProducts")}
          </h2>
          <ProductGrid products={relatedProducts.map((p) => ({ ...p, images: parseImages(p.images) }))} />
        </div>
      )}
    </div>
  );
}
