import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    // User profile (own profile)
    if (type === "user-profile") {
      const userId = searchParams.get("userId") || session.user.id;
      if (userId !== session.user.id && session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          city: true,
          address: true,
          role: true,
          isActive: true,
          createdAt: true,
          sellerProfile: true,
        },
      });

      return NextResponse.json(user);
    }

    // Seller profile
    if (type === "seller-profile") {
      const userId = searchParams.get("userId") || session.user.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { sellerProfile: true },
      });

      return NextResponse.json(user);
    }

    // Admin only endpoints below
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (type === "stats") {
      const [users, products, orders, revenue] = await Promise.all([
        prisma.user.count(),
        prisma.product.count(),
        prisma.order.count(),
        prisma.order.aggregate({
          where: { status: { in: ["CONFIRMED", "SHIPPED", "DELIVERED"] } },
          _sum: { totalAmount: true },
        }),
      ]);

      return NextResponse.json({
        users,
        products,
        orders,
        revenue: revenue._sum.totalAmount || 0,
      });
    }

    if (type === "users") {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          city: true,
          sellerProfile: { select: { shopName: true, isVerified: true } },
        },
      });
      return NextResponse.json(users);
    }

    if (type === "products") {
      const products = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
          seller: {
            select: {
              name: true,
              sellerProfile: { select: { shopName: true } },
            },
          },
        },
      });
      return NextResponse.json(products);
    }

    if (type === "orders") {
      const orders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { name: true } },
          seller: {
            select: {
              name: true,
              sellerProfile: { select: { shopName: true } },
            },
          },
          items: {
            include: { product: { select: { name: true } } },
          },
        },
      });
      return NextResponse.json(orders);
    }

    if (type === "categories") {
      const categories = await prisma.category.findMany({
        include: {
          parent: true,
          _count: { select: { products: true } },
        },
        orderBy: { name: "asc" },
      });
      return NextResponse.json(categories);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Admin API error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type } = body;

    // User profile update (own profile)
    if (type === "user-profile") {
      const user = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name: body.name,
          phone: body.phone,
          city: body.city,
          address: body.address,
        },
      });
      return NextResponse.json(user);
    }

    // Seller profile update (own profile)
    if (type === "seller-profile") {
      const profile = await prisma.sellerProfile.update({
        where: { userId: session.user.id },
        data: {
          shopName: body.shopName,
          shopNameAr: body.shopNameAr,
          description: body.description,
          descriptionAr: body.descriptionAr,
          location: body.location,
        },
      });
      return NextResponse.json(profile);
    }

    // Admin only endpoints
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (type === "toggle-user") {
      const user = await prisma.user.update({
        where: { id: body.userId },
        data: { isActive: body.isActive },
      });
      return NextResponse.json(user);
    }

    if (type === "change-role") {
      const user = await prisma.user.update({
        where: { id: body.userId },
        data: { role: body.role },
      });
      return NextResponse.json(user);
    }

    if (type === "verify-seller") {
      const profile = await prisma.sellerProfile.update({
        where: { userId: body.userId },
        data: { isVerified: body.isVerified },
      });
      return NextResponse.json(profile);
    }

    if (type === "delete-category") {
      await prisma.category.delete({ where: { id: body.categoryId } });
      return NextResponse.json({ message: "Category deleted" });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Admin PATCH error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
