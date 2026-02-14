import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseImages(images: string | string[]): string[] {
  if (Array.isArray(images)) return images;
  try {
    return JSON.parse(images || "[]");
  } catch {
    return [];
  }
}
