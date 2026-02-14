import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  city: z.string().optional(),
});

export const sellerRegisterSchema = registerSchema.extend({
  shopName: z.string().min(2, "Shop name must be at least 2 characters"),
  shopNameAr: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  categoryId: z.string().min(1, "Category is required"),
  carMake: z.string().optional(),
  carModel: z.string().optional(),
  carYear: z.string().optional(),
  isAvailable: z.boolean().default(true),
});

export const orderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ).min(1, "Order must have at least one item"),
  shippingAddress: z.string().min(5, "Shipping address is required"),
  phone: z.string().min(8, "Phone number is required"),
  notes: z.string().optional(),
});

export const messageSchema = z.object({
  receiverId: z.string().min(1, "Receiver is required"),
  content: z.string().min(1, "Message cannot be empty"),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
  nameAr: z.string().optional(),
  slug: z.string().min(2, "Slug is required"),
  icon: z.string().optional(),
  parentId: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type SellerRegisterInput = z.infer<typeof sellerRegisterSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
