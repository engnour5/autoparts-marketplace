import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import OrderCard from "@/components/orders/OrderCard";

export default async function SellerOrdersPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SELLER") {
    redirect(`/${locale}/auth/login`);
  }

  const t = await getTranslations();

  const orders = await prisma.order.findMany({
    where: { sellerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      seller: {
        select: {
          id: true,
          name: true,
          sellerProfile: { select: { shopName: true } },
        },
      },
      items: {
        include: {
          product: { select: { id: true, name: true, images: true } },
        },
      },
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t("orders.sellerOrders")}</h1>

      {orders.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          {t("orders.noOrders")}
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={JSON.parse(JSON.stringify(order))}
              canUpdateStatus
            />
          ))}
        </div>
      )}
    </div>
  );
}
