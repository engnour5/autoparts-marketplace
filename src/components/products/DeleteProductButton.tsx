"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function DeleteProductButton({
  productId,
}: {
  productId: string;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(t("products.deleteConfirm"))) return;

    setDeleting(true);
    try {
      await fetch(`/api/products/${productId}`, { method: "DELETE" });
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={deleting}
    >
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  );
}
