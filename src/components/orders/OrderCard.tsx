"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

interface OrderCardProps {
  order: {
    id: string;
    status: string;
    totalAmount: number;
    shippingAddress: string;
    phone: string;
    notes?: string | null;
    createdAt: string;
    customer: { name: string; phone?: string | null };
    seller: {
      name: string;
      sellerProfile?: { shopName: string } | null;
    };
    items: {
      id: string;
      quantity: number;
      price: number;
      product: { name: string; images: string[] };
    }[];
  };
  canUpdateStatus?: boolean;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function OrderCard({ order, canUpdateStatus }: OrderCardProps) {
  const t = useTranslations();
  const router = useRouter();

  async function updateStatus(status: string) {
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, status }),
    });
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">
            #{order.id.slice(-8).toUpperCase()}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canUpdateStatus ? (
            <Select
              value={order.status}
              onValueChange={updateStatus}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">{t("orders.pending")}</SelectItem>
                <SelectItem value="CONFIRMED">{t("orders.confirmed")}</SelectItem>
                <SelectItem value="SHIPPED">{t("orders.shipped")}</SelectItem>
                <SelectItem value="DELIVERED">{t("orders.delivered")}</SelectItem>
                <SelectItem value="CANCELLED">{t("orders.cancelled")}</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Badge className={statusColors[order.status] || ""}>
              {t(`orders.${order.status.toLowerCase()}`)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.product.name} x{item.quantity}
              </span>
              <span>
                {(item.price * item.quantity).toLocaleString()} {t("common.currency")}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t mt-3 pt-3 flex justify-between font-bold">
          <span>{t("orders.orderTotal")}</span>
          <span>
            {order.totalAmount.toLocaleString()} {t("common.currency")}
          </span>
        </div>
        <div className="mt-3 text-sm text-muted-foreground space-y-1">
          <p>
            {t("orders.shippingAddress")}: {order.shippingAddress}
          </p>
          <p>
            {t("orders.phone")}: {order.phone}
          </p>
          {order.notes && (
            <p>
              {t("orders.notes")}: {order.notes}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
