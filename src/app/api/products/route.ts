import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";
import { parseImages } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const carMake = searchParams.get("carMake") || "";
    const sort = searchParams.get("sort") || "newest";
    const sellerId = searchParams.get("sellerId") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const where: Record<string, unknown> = {
      isAvailable: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { nameAr: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { carMake: { contains: search, mode: "insensitive" } },
        { carModel: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    if (carMake) {
      where.carMake = { contains: carMake, mode: "insensitive" };
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    let orderBy: Record<string, string> = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: true,
          seller: {
            select: {
              id: true,
              name: true,
              sellerProfile: {
                select: { shopName: true, shopNameAr: true, isVerified: true },
              },
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const parsed = products.map((p) => ({
      ...p,
      images: parseImages(p.images),
    }));

    return NextResponse.json({
      products: parsed,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        ...validation.data,
        sellerId: session.user.id,
        images: JSON.stringify(body.images || []),
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
