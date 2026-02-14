"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { parseImages } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    nameAr?: string | null;
    price: number;
    currency: string;
    images: string | string[];
    isAvailable: boolean;
    stock: number;
    carMake?: string | null;
    carModel?: string | null;
    category: { name: string; nameAr?: string | null };
    seller: {
      name: string;
      sellerProfile?: { shopName: string; shopNameAr?: string | null } | null;
    };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const locale = useLocale();
  const t = useTranslations();
  const isAr = locale === "ar";

  const images = parseImages(product.images);
  const displayName = isAr && product.nameAr ? product.nameAr : product.name;
  const shopName =
    isAr && product.seller.sellerProfile?.shopNameAr
      ? product.seller.sellerProfile.shopNameAr
      : product.seller.sellerProfile?.shopName || product.seller.name;
  const categoryName =
    isAr && product.category.nameAr
      ? product.category.nameAr
      : product.category.name;

  return (
    <Link href={`/${locale}/products/${product.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
        <div className="aspect-square relative bg-muted">
          {images.length > 0 ? (
            <Image
              src={images[0]}
              alt={displayName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          {!product.isAvailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive">{t("products.outOfStock")}</Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="mb-1">
            <Badge variant="secondary" className="text-xs">
              {categoryName}
            </Badge>
          </div>
          <h3 className="font-semibold text-sm line-clamp-2 mb-1">
            {displayName}
          </h3>
          {product.carMake && (
            <p className="text-xs text-muted-foreground mb-2">
              {product.carMake}
              {product.carModel ? ` ${product.carModel}` : ""}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">
              {product.price.toLocaleString()} {t("common.currency")}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{shopName}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
