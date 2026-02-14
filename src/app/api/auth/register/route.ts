import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema, sellerRegisterSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const isSeller = body.shopName !== undefined;

    const validation = isSeller
      ? sellerRegisterSchema.safeParse(body)
      : registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(body.password, 12);

    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        name: body.name,
        phone: body.phone || null,
        city: body.city || null,
        role: isSeller ? "SELLER" : "CUSTOMER",
        ...(isSeller && {
          sellerProfile: {
            create: {
              shopName: body.shopName,
              shopNameAr: body.shopNameAr || null,
              description: body.description || null,
              location: body.location || null,
            },
          },
        }),
      },
    });

    return NextResponse.json(
      { message: "Account created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
