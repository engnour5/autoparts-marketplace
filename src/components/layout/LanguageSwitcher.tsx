"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export default function LanguageSwitcher({ locale }: { locale: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const switchedLocale = locale === "en" ? "ar" : "en";
  const newPath = pathname.replace(`/${locale}`, `/${switchedLocale}`);

  return (
    <Link href={newPath}>
      <Button variant="ghost" size="sm" className="gap-1">
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{t("switchLang")}</span>
      </Button>
    </Link>
  );
}
