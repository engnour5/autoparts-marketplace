import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminSettingsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect(`/${locale}/auth/login`);
  }

  const t = await getTranslations();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t("admin.platformSettings")}</h1>

      <div className="grid gap-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Platform Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform Name</span>
              <span className="font-medium">{t("common.appName")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Default Currency</span>
              <Badge>DZD</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Languages</span>
              <div className="flex gap-1">
                <Badge variant="secondary">English</Badge>
                <Badge variant="secondary">العربية</Badge>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment</span>
              <Badge variant="secondary">Cash on Delivery</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Framework</span>
              <span>Next.js 14</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Database</span>
              <span>PostgreSQL + Prisma</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Auth</span>
              <span>NextAuth.js</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
