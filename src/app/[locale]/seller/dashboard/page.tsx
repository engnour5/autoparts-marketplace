import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, DollarSign, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SellerDashboardPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SELLER") {
    redirect(`/${locale}/auth/login`);
  }

  const t = await getTranslations();

  const [productCount, orderCount, pendingOrders, revenue] = await Promise.all([
    prisma.product.count({ where: { sellerId: session.user.id } }),
    prisma.order.count({ where: { sellerId: session.user.id } }),
    prisma.order.count({
      where: { sellerId: session.user.id, status: "PENDING" },
    }),
    prisma.order.aggregate({
      where: {
        sellerId: session.user.id,
        status: { in: ["CONFIRMED", "SHIPPED", "DELIVERED"] },
      },
      _sum: { totalAmount: true },
    }),
  ]);

  const recentOrders = await prisma.order.findMany({
    where: { sellerId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      customer: { select: { name: true } },
    },
  });

  const stats = [
    {
      label: t("seller.totalProducts"),
      value: productCount,
      icon: Package,
      href: `/${locale}/seller/products`,
    },
    {
      label: t("seller.totalOrders"),
      value: orderCount,
      icon: ShoppingCart,
      href: `/${locale}/seller/orders`,
    },
    {
      label: t("seller.pendingOrders"),
      value: pendingOrders,
      icon: Clock,
      href: `/${locale}/seller/orders`,
    },
    {
      label: t("seller.totalRevenue"),
      value: `${(revenue._sum.totalAmount || 0).toLocaleString()} ${t("common.currency")}`,
      icon: DollarSign,
      href: "#",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{t("seller.dashboard")}</h1>
        <Link href={`/${locale}/seller/products/new`}>
          <Button>{t("products.addProduct")}</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>{t("orders.sellerOrders")}</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground">{t("orders.noOrders")}</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{order.customer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {order.totalAmount.toLocaleString()} {t("common.currency")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t(`orders.${order.status.toLowerCase()}`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
