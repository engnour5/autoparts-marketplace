"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrderFormProps {
  product: {
    id: string;
    name: string;
    price: number;
    images: string | string[];
  };
}

export default function OrderForm({ product }: OrderFormProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const data = {
      items: [{ productId: product.id, quantity }],
      shippingAddress: formData.get("shippingAddress") as string,
      phone: formData.get("phone") as string,
      notes: formData.get("notes") as string,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        setError(result.error);
        setLoading(false);
        return;
      }

      router.push(`/${locale}/customer/orders`);
      router.refresh();
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("orders.placeOrder")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="p-3 rounded-lg border">
            <p className="font-medium">{product.name}</p>
            <p className="text-primary font-bold">
              {product.price.toLocaleString()} {t("common.currency")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">{t("common.quantity")}</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
            <p className="text-sm text-muted-foreground">
              {t("common.total")}: {(product.price * quantity).toLocaleString()}{" "}
              {t("common.currency")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shippingAddress">
              {t("orders.shippingAddress")}
            </Label>
            <Textarea
              id="shippingAddress"
              name="shippingAddress"
              required
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t("orders.phone")}</Label>
            <Input id="phone" name="phone" type="tel" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("orders.notes")}</Label>
            <Textarea id="notes" name="notes" rows={2} />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("common.loading") : t("orders.placeOrder")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
