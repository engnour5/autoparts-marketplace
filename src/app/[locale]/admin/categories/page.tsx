"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  nameAr?: string | null;
  slug: string;
  parent?: { name: string } | null;
  _count: { products: number };
}

export default function AdminCategoriesPage() {
  const t = useTranslations();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const res = await fetch("/api/admin?type=categories");
    const data = await res.json();
    setCategories(data);
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      nameAr: formData.get("nameAr") as string,
      slug: formData.get("slug") as string,
      icon: formData.get("icon") as string,
    };

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setShowForm(false);
        fetchCategories();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(categoryId: string) {
    if (!confirm("Delete this category?")) return;

    await fetch("/api/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "delete-category", categoryId }),
    });
    fetchCategories();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t("admin.manageCategories")}</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {t("admin.addCategory")}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("admin.addCategory")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("admin.categoryName")}</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameAr">{t("admin.categoryNameAr")}</Label>
                  <Input id="nameAr" name="nameAr" dir="rtl" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">{t("admin.categorySlug")}</Label>
                  <Input id="slug" name="slug" required placeholder="engine-parts" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Input id="icon" name="icon" placeholder="optional" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? t("common.loading") : t("common.save")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  {t("common.cancel")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.categoryName")}</TableHead>
              <TableHead>{t("admin.categoryNameAr")}</TableHead>
              <TableHead>{t("admin.categorySlug")}</TableHead>
              <TableHead>{t("common.products")}</TableHead>
              <TableHead>{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell dir="rtl">{cat.nameAr || "-"}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{cat.slug}</Badge>
                </TableCell>
                <TableCell>{cat._count.products}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(cat.id)}
                    disabled={cat._count.products > 0}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
