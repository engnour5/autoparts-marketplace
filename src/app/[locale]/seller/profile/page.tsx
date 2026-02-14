"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SellerProfilePage() {
  const t = useTranslations();
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Record<string, string>>({});

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/admin?type=seller-profile&userId=${session.user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.sellerProfile) setProfile(data.sellerProfile);
        })
        .catch(console.error);
    }
  }, [session]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      shopName: formData.get("shopName"),
      shopNameAr: formData.get("shopNameAr"),
      description: formData.get("description"),
      descriptionAr: formData.get("descriptionAr"),
      location: formData.get("location"),
    };

    try {
      await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "seller-profile", ...data }),
      });
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">{t("seller.editShop")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("seller.shopProfile")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shopName">{t("auth.shopName")}</Label>
                <Input
                  id="shopName"
                  name="shopName"
                  defaultValue={profile.shopName}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shopNameAr">{t("auth.shopNameAr")}</Label>
                <Input
                  id="shopNameAr"
                  name="shopNameAr"
                  dir="rtl"
                  defaultValue={profile.shopNameAr}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">{t("auth.location")}</Label>
              <Input
                id="location"
                name="location"
                defaultValue={profile.location}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("auth.description")}</Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={profile.description}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descriptionAr">
                {t("products.descriptionAr")}
              </Label>
              <Textarea
                id="descriptionAr"
                name="descriptionAr"
                dir="rtl"
                rows={3}
                defaultValue={profile.descriptionAr}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? t("common.loading") : t("common.save")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
