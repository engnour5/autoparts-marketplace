"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, ShoppingCart, MessageSquare, Settings, LogOut, LayoutDashboard, Package } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useState } from "react";

export default function Header({ locale }: { locale: string }) {
  const t = useTranslations();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isRtl = locale === "ar";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <ShoppingCart className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">{t("common.appName")}</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href={`/${locale}/products`}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            {t("nav.browseProducts")}
          </Link>

          {session?.user?.role === "SELLER" && (
            <Link
              href={`/${locale}/seller/dashboard`}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {t("nav.sellerDashboard")}
            </Link>
          )}

          {session?.user?.role === "ADMIN" && (
            <Link
              href={`/${locale}/admin/dashboard`}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {t("nav.adminPanel")}
            </Link>
          )}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />

          {session?.user ? (
            <>
              <Link href={`/${locale}/messages`}>
                <Button variant="ghost" size="icon">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRtl ? "start" : "end"}>
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {session.user.name}
                  </div>
                  <DropdownMenuSeparator />

                  {session.user.role === "SELLER" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href={`/${locale}/seller/dashboard`}>
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          {t("common.dashboard")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/${locale}/seller/products`}>
                          <Package className="mr-2 h-4 w-4" />
                          {t("products.manageProducts")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/${locale}/seller/orders`}>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {t("common.orders")}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  {session.user.role === "CUSTOMER" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href={`/${locale}/customer/orders`}>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {t("nav.myOrders")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/${locale}/customer/profile`}>
                          <User className="mr-2 h-4 w-4" />
                          {t("common.profile")}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  {session.user.role === "ADMIN" && (
                    <DropdownMenuItem asChild>
                      <Link href={`/${locale}/admin/dashboard`}>
                        <Settings className="mr-2 h-4 w-4" />
                        {t("nav.adminPanel")}
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("common.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href={`/${locale}/auth/login`}>
                <Button variant="ghost" size="sm">
                  {t("common.login")}
                </Button>
              </Link>
              <Link href={`/${locale}/auth/register`}>
                <Button size="sm">{t("common.register")}</Button>
              </Link>
            </div>
          )}

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRtl ? "right" : "left"}>
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  href={`/${locale}/products`}
                  className="text-lg font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  {t("nav.browseProducts")}
                </Link>

                {!session?.user && (
                  <>
                    <Link
                      href={`/${locale}/auth/login`}
                      className="text-lg font-medium"
                      onClick={() => setMobileOpen(false)}
                    >
                      {t("common.login")}
                    </Link>
                    <Link
                      href={`/${locale}/auth/register`}
                      className="text-lg font-medium"
                      onClick={() => setMobileOpen(false)}
                    >
                      {t("common.register")}
                    </Link>
                  </>
                )}

                {session?.user?.role === "SELLER" && (
                  <>
                    <Link
                      href={`/${locale}/seller/dashboard`}
                      className="text-lg font-medium"
                      onClick={() => setMobileOpen(false)}
                    >
                      {t("nav.sellerDashboard")}
                    </Link>
                    <Link
                      href={`/${locale}/seller/orders`}
                      className="text-lg font-medium"
                      onClick={() => setMobileOpen(false)}
                    >
                      {t("common.orders")}
                    </Link>
                  </>
                )}

                {session?.user?.role === "CUSTOMER" && (
                  <>
                    <Link
                      href={`/${locale}/customer/orders`}
                      className="text-lg font-medium"
                      onClick={() => setMobileOpen(false)}
                    >
                      {t("nav.myOrders")}
                    </Link>
                  </>
                )}

                {session?.user?.role === "ADMIN" && (
                  <Link
                    href={`/${locale}/admin/dashboard`}
                    className="text-lg font-medium"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t("nav.adminPanel")}
                  </Link>
                )}

                {session?.user && (
                  <button
                    onClick={() => {
                      signOut();
                      setMobileOpen(false);
                    }}
                    className="text-lg font-medium text-left"
                  >
                    {t("common.logout")}
                  </button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
