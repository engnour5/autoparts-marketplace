"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CustomerProfilePage() {
  const t = useTranslations();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/admin?type=user-profile&userId=${session.user.id}`)
        .then((res) => res.json())
        .then(setProfile)
        .catch(console.error);
    }
  }, [session]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      type: "user-profile",
      name: formData.get("name"),
      phone: formData.get("phone"),
      city: formData.get("city"),
      address: formData.get("address"),
    };

    try {
      await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-3xl font-bold mb-6">{t("common.profile")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("common.profile")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {success && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                Profile updated!
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">{t("auth.name")}</Label>
              <Input
                id="name"
                name="name"
                defaultValue={profile.name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                value={profile.email || ""}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t("auth.phone")}</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={profile.phone}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">{t("auth.city")}</Label>
              <Input id="city" name="city" defaultValue={profile.city} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">{t("orders.shippingAddress")}</Label>
              <Input
                id="address"
                name="address"
                defaultValue={profile.address}
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
