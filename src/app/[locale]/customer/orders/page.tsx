import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import OrderCard from "@/components/orders/OrderCard";
import OrderForm from "@/components/orders/OrderForm";

export default async function CustomerOrdersPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { product?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/${locale}/auth/login`);
  }

  const t = await getTranslations();

  // If product param exists, show order form
  let orderProduct = null;
  if (searchParams.product) {
    orderProduct = await prisma.product.findUnique({
      where: { id: searchParams.product },
      select: { id: true, name: true, price: true, images: true },
    });
  }

  const orders = await prisma.order.findMany({
    where: { customerId: session.user.id },
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
      <h1 className="text-3xl font-bold mb-6">{t("orders.customerOrders")}</h1>

      {orderProduct && (
        <div className="mb-8 max-w-md">
          <OrderForm product={orderProduct} />
        </div>
      )}

      {orders.length === 0 && !orderProduct ? (
        <p className="text-muted-foreground text-center py-12">
          {t("orders.noOrders")}
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={JSON.parse(JSON.stringify(order))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
