import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, Store, Truck, Shield } from "lucide-react";
import ProductGrid from "@/components/products/ProductGrid";

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations();
  const isAr = locale === "ar";

  const [featuredProducts, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isAvailable: true },
      orderBy: { createdAt: "desc" },
      take: 8,
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
    prisma.category.findMany({
      where: { parentId: null },
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
      take: 8,
    }),
  ]);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-primary/5 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t("home.hero")}
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("home.heroSubtitle")}
          </p>

          <form
            action={`/${locale}/products`}
            method="GET"
            className="max-w-xl mx-auto flex gap-2"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rtl:left-auto rtl:right-3" />
              <Input
                name="search"
                placeholder={t("home.searchPlaceholder")}
                className="pl-9 rtl:pl-0 rtl:pr-9 h-12"
              />
            </div>
            <Button type="submit" size="lg">
              {t("common.search")}
            </Button>
          </form>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 justify-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">
                  {isAr ? "التوصيل لجميع الولايات" : "Delivery Nationwide"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isAr ? "الدفع عند الاستلام" : "Cash on Delivery"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">
                  {isAr ? "بائعون موثوقون" : "Trusted Sellers"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isAr ? "بائعون معتمدون" : "Verified Sellers"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">
                  {isAr ? "ضمان الجودة" : "Quality Guarantee"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isAr ? "قطع أصلية" : "Original Parts"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">
              {t("home.topCategories")}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/${locale}/categories/${cat.slug}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6 text-center">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <ShoppingCart className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold">
                        {isAr && cat.nameAr ? cat.nameAr : cat.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {cat._count.products} {t("common.products")}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {t("home.featuredProducts")}
              </h2>
              <Link href={`/${locale}/products`}>
                <Button variant="outline">{t("home.browseAll")}</Button>
              </Link>
            </div>
            <ProductGrid products={featuredProducts.map((p) => ({ ...p, images: parseImages(p.images) }))} />
          </div>
        </section>
      )}

      {/* Become a Seller CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t("home.becomeSeller")}</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            {t("home.becomeSellerDesc")}
          </p>
          <Link href={`/${locale}/auth/register/seller`}>
            <Button size="lg">{t("home.becomeSeller")}</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
