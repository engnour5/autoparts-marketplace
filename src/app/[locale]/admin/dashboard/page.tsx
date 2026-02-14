import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, ShoppingCart, DollarSign } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect(`/${locale}/auth/login`);
  }

  const t = await getTranslations();

  const [users, products, orders, revenue, recentOrders] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { status: { in: ["CONFIRMED", "SHIPPED", "DELIVERED"] } },
      _sum: { totalAmount: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        customer: { select: { name: true } },
        seller: {
          select: {
            name: true,
            sellerProfile: { select: { shopName: true } },
          },
        },
      },
    }),
  ]);

  const stats = [
    {
      label: t("admin.totalUsers"),
      value: users,
      icon: Users,
      href: `/${locale}/admin/users`,
    },
    {
      label: t("admin.totalProducts"),
      value: products,
      icon: Package,
      href: `/${locale}/admin/products`,
    },
    {
      label: t("admin.totalOrders"),
      value: orders,
      icon: ShoppingCart,
      href: `/${locale}/admin/orders`,
    },
    {
      label: t("admin.totalRevenue"),
      value: `${(revenue._sum.totalAmount || 0).toLocaleString()} ${t("common.currency")}`,
      icon: DollarSign,
      href: "#",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t("admin.dashboard")}</h1>

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

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Link href={`/${locale}/admin/users`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 mb-2" />
              <h3 className="font-semibold">{t("admin.manageUsers")}</h3>
            </CardContent>
          </Card>
        </Link>
        <Link href={`/${locale}/admin/categories`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <Package className="h-8 w-8 mb-2" />
              <h3 className="font-semibold">{t("admin.manageCategories")}</h3>
            </CardContent>
          </Card>
        </Link>
        <Link href={`/${locale}/admin/orders`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <ShoppingCart className="h-8 w-8 mb-2" />
              <h3 className="font-semibold">{t("admin.manageOrders")}</h3>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>{t("orders.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div>
                  <p className="font-medium">{order.customer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    → {order.seller.sellerProfile?.shopName || order.seller.name}
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
        </CardContent>
      </Card>
    </div>
  );
}
