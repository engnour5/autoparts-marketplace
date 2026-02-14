"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUpload({ images, onChange }: ImageUploadProps) {
  const t = useTranslations();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        onChange([...images, ...data.urls]);
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {images.map((url, i) => (
          <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
            <Image src={url} alt="" fill className="object-cover" sizes="150px" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 hover:bg-muted transition-colors"
        >
          {uploading ? (
            <span className="text-xs">{t("common.loading")}</span>
          ) : (
            <>
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {t("products.uploadImages")}
              </span>
            </>
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
