"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { ShoppingCart } from "lucide-react";

export default function Footer() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <ShoppingCart className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">{t("common.appName")}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("footer.aboutText")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={`/${locale}/products`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("nav.browseProducts")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/auth/register/seller`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("home.becomeSeller")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/auth/register`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("common.register")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">{t("footer.contact")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>contact@autoparts-market.dz</li>
              <li>+213 XXX XXX XXX</li>
              <li>Algeria</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {t("common.appName")}.{" "}
          {t("footer.rights")}.
        </div>
      </div>
    </footer>
  );
}
