"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageUpload from "./ImageUpload";

interface Category {
  id: string;
  name: string;
  nameAr?: string | null;
  slug: string;
}

interface ProductData {
  id?: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  price: number;
  stock: number;
  categoryId: string;
  carMake?: string;
  carModel?: string;
  carYear?: string;
  images: string[];
  isAvailable: boolean;
}

export default function ProductForm({
  product,
  categories,
}: {
  product?: ProductData;
  categories: Category[];
}) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const isAr = locale === "ar";
  const isEdit = !!product?.id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [categoryId, setCategoryId] = useState(product?.categoryId || "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      nameAr: formData.get("nameAr") as string,
      description: formData.get("description") as string,
      descriptionAr: formData.get("descriptionAr") as string,
      price: parseFloat(formData.get("price") as string),
      stock: parseInt(formData.get("stock") as string),
      categoryId,
      carMake: formData.get("carMake") as string,
      carModel: formData.get("carModel") as string,
      carYear: formData.get("carYear") as string,
      images,
      isAvailable: true,
    };

    try {
      const url = isEdit ? `/api/products/${product.id}` : "/api/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error);
        setLoading(false);
        return;
      }

      router.push(`/${locale}/seller/products`);
      router.refresh();
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t("products.productName")}</Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={product?.name}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nameAr">{t("products.productNameAr")}</Label>
          <Input
            id="nameAr"
            name="nameAr"
            dir="rtl"
            defaultValue={product?.nameAr}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="description">{t("products.description")}</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={product?.description}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="descriptionAr">{t("products.descriptionAr")}</Label>
          <Textarea
            id="descriptionAr"
            name="descriptionAr"
            dir="rtl"
            rows={3}
            defaultValue={product?.descriptionAr}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">{t("products.price")}</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={product?.price}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">{t("products.stock")}</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min="0"
            required
            defaultValue={product?.stock ?? 0}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("products.category")}</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder={t("products.category")} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {isAr && cat.nameAr ? cat.nameAr : cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="carMake">{t("products.carMake")}</Label>
          <Input
            id="carMake"
            name="carMake"
            defaultValue={product?.carMake}
            placeholder="Toyota, Peugeot..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="carModel">{t("products.carModel")}</Label>
          <Input
            id="carModel"
            name="carModel"
            defaultValue={product?.carModel}
            placeholder="Corolla, 208..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="carYear">{t("products.carYear")}</Label>
          <Input
            id="carYear"
            name="carYear"
            defaultValue={product?.carYear}
            placeholder="2020"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("products.images")}</Label>
        <ImageUpload images={images} onChange={setImages} />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading
            ? t("common.loading")
            : isEdit
            ? t("common.save")
            : t("products.addProduct")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}
