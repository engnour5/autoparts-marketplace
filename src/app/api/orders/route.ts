import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { orderSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || session.user.role;

    let where: Record<string, unknown> = {};

    if (role === "SELLER" || session.user.role === "SELLER") {
      where = { sellerId: session.user.id };
    } else if (session.user.role === "ADMIN") {
      // Admin can see all orders
    } else {
      where = { customerId: session.user.id };
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        seller: {
          select: {
            id: true,
            name: true,
            sellerProfile: { select: { shopName: true } },
          },
        },
        items: {
          include: {
            product: { select: { id: true, name: true, images: true } },
          },
        },
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = orderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { items, shippingAddress, phone, notes } = validation.data;

    // Fetch products and verify
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "Some products not found" },
        { status: 400 }
      );
    }

    // Group items by seller
    const sellerGroups: Record<
      string,
      { productId: string; quantity: number; price: number }[]
    > = {};

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product || !product.isAvailable) {
        return NextResponse.json(
          { error: `Product ${product?.name || item.productId} is not available` },
          { status: 400 }
        );
      }

      if (!sellerGroups[product.sellerId]) {
        sellerGroups[product.sellerId] = [];
      }
      sellerGroups[product.sellerId].push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Create one order per seller
    const orders = [];
    for (const [sellerId, orderItems] of Object.entries(sellerGroups)) {
      const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const order = await prisma.order.create({
        data: {
          customerId: session.user.id,
          sellerId,
          totalAmount,
          shippingAddress,
          phone,
          notes,
          items: {
            create: orderItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: {
            include: { product: { select: { name: true } } },
          },
        },
      });
      orders.push(order);
    }

    return NextResponse.json(orders, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
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
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Order ID and status are required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only seller of the order or admin can update status
    if (order.sellerId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
