"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

interface User {
  id: string;
  name: string;
  role: string;
  isActive: boolean;
  sellerProfile?: { shopName: string; isVerified: boolean } | null;
}

export default function AdminUserActions({ user }: { user: User }) {
  const t = useTranslations();
  const router = useRouter();

  async function toggleActive() {
    await fetch("/api/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "toggle-user",
        userId: user.id,
        isActive: !user.isActive,
      }),
    });
    router.refresh();
  }

  async function verifySeller() {
    await fetch("/api/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "verify-seller",
        userId: user.id,
        isVerified: !user.sellerProfile?.isVerified,
      }),
    });
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={toggleActive}>
          {user.isActive ? t("admin.deactivateUser") : t("admin.activateUser")}
        </DropdownMenuItem>
        {user.sellerProfile && (
          <DropdownMenuItem onClick={verifySeller}>
            {user.sellerProfile.isVerified
              ? t("seller.unverified")
              : t("seller.verified")}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
