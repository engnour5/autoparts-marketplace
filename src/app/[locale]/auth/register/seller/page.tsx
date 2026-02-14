"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SellerRegisterPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = useTranslations();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      phone: formData.get("phone") as string,
      city: formData.get("city") as string,
      shopName: formData.get("shopName") as string,
      shopNameAr: formData.get("shopNameAr") as string,
      location: formData.get("location") as string,
      description: formData.get("description") as string,
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error);
        setLoading(false);
        return;
      }

      router.push(`/${locale}/auth/login`);
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {t("auth.sellerRegisterTitle")}
          </CardTitle>
          <CardDescription>{t("home.becomeSellerDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("auth.name")}</Label>
                <Input id="name" name="name" required minLength={2} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="example@mail.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("auth.phone")}</Label>
                <Input id="phone" name="phone" type="tel" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">{t("auth.city")}</Label>
              <Input id="city" name="city" />
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-3">{t("seller.shopProfile")}</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shopName">{t("auth.shopName")}</Label>
                  <Input id="shopName" name="shopName" required minLength={2} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shopNameAr">{t("auth.shopNameAr")}</Label>
                  <Input id="shopNameAr" name="shopNameAr" dir="rtl" />
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="location">{t("auth.location")}</Label>
                <Input id="location" name="location" />
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="description">{t("auth.description")}</Label>
                <Textarea id="description" name="description" rows={3} />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("common.loading") : t("auth.registerButton")}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <Link
              href={`/${locale}/auth/register`}
              className="font-medium text-primary hover:underline"
            >
              {t("auth.registerAsCustomer")}
            </Link>
          </div>

          <div className="mt-2 text-center text-sm">
            <span className="text-muted-foreground">
              {t("auth.hasAccount")}{" "}
            </span>
            <Link
              href={`/${locale}/auth/login`}
              className="font-medium text-primary hover:underline"
            >
              {t("common.login")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
