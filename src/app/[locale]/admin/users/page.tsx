import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AdminUserActions from "@/components/admin/AdminUserActions";

export default async function AdminUsersPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect(`/${locale}/auth/login`);
  }

  const t = await getTranslations();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      city: true,
      sellerProfile: { select: { shopName: true, isVerified: true } },
    },
  });

  const roleColors: Record<string, string> = {
    ADMIN: "bg-red-100 text-red-800",
    SELLER: "bg-blue-100 text-blue-800",
    CUSTOMER: "bg-green-100 text-green-800",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t("admin.manageUsers")}</h1>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("auth.name")}</TableHead>
              <TableHead>{t("auth.email")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>{t("auth.city")}</TableHead>
              <TableHead>{t("common.date")}</TableHead>
              <TableHead>{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    {user.sellerProfile && (
                      <p className="text-xs text-muted-foreground">
                        {user.sellerProfile.shopName}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? "default" : "destructive"}>
                    {user.isActive ? t("admin.activateUser") : t("admin.deactivateUser")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={roleColors[user.role]}>
                    {t(`common.${user.role.toLowerCase()}`)}
                  </Badge>
                </TableCell>
                <TableCell>{user.city || "-"}</TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <AdminUserActions user={user} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
