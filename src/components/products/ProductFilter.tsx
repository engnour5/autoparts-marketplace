"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useState } from "react";

interface Category {
  id: string;
  name: string;
  nameAr?: string | null;
  slug: string;
}

export default function ProductFilter({
  categories,
}: {
  categories: Category[];
}) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAr = locale === "ar";

  const [search, setSearch] = useState(searchParams.get("search") || "");

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/${locale}/products?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateFilter("search", search);
  }

  function clearFilters() {
    setSearch("");
    router.push(`/${locale}/products`);
  }

  const hasFilters =
    searchParams.get("search") ||
    searchParams.get("category") ||
    searchParams.get("sort");

  return (
    <div className="space-y-4 mb-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rtl:left-auto rtl:right-3" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("home.searchPlaceholder")}
            className="pl-9 rtl:pl-0 rtl:pr-9"
          />
        </div>
        <Button type="submit">{t("common.search")}</Button>
      </form>

      <div className="flex flex-wrap gap-3 items-center">
        <Select
          value={searchParams.get("category") || "all"}
          onValueChange={(v) => updateFilter("category", v)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("products.filterByCategory")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {isAr && cat.nameAr ? cat.nameAr : cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("sort") || "newest"}
          onValueChange={(v) => updateFilter("sort", v)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("products.sortBy")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t("products.sortNewest")}</SelectItem>
            <SelectItem value="price_asc">
              {t("products.sortPriceAsc")}
            </SelectItem>
            <SelectItem value="price_desc">
              {t("products.sortPriceDesc")}
            </SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            {t("common.cancel")}
          </Button>
        )}
      </div>
    </div>
  );
}
