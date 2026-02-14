"use client";

import ProductCard from "./ProductCard";
import { useTranslations } from "next-intl";

interface Product {
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
}

export default function ProductGrid({ products }: { products: Product[] }) {
  const t = useTranslations();

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">{t("products.noProducts")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
