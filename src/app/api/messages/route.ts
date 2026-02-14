import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { messageSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationWith = searchParams.get("with");

    if (conversationWith) {
      // Get messages in a conversation
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: session.user.id, receiverId: conversationWith },
            { senderId: conversationWith, receiverId: session.user.id },
          ],
        },
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, name: true, avatar: true } },
          receiver: { select: { id: true, name: true, avatar: true } },
        },
      });

      // Mark as read
      await prisma.message.updateMany({
        where: {
          senderId: conversationWith,
          receiverId: session.user.id,
          isRead: false,
        },
        data: { isRead: true },
      });

      return NextResponse.json(messages);
    }

    // Get conversation list
    const sentMessages = await prisma.message.findMany({
      where: { senderId: session.user.id },
      select: { receiverId: true },
      distinct: ["receiverId"],
    });

    const receivedMessages = await prisma.message.findMany({
      where: { receiverId: session.user.id },
      select: { senderId: true },
      distinct: ["senderId"],
    });

    const contactIdSet = new Set([
      ...sentMessages.map((m) => m.receiverId),
      ...receivedMessages.map((m) => m.senderId),
    ]);
    const contactIds = Array.from(contactIdSet);

    const conversations = await Promise.all(
      contactIds.map(async (contactId) => {
        const [contact, lastMessage, unreadCount] = await Promise.all([
          prisma.user.findUnique({
            where: { id: contactId },
            select: {
              id: true,
              name: true,
              avatar: true,
              sellerProfile: { select: { shopName: true } },
            },
          }),
          prisma.message.findFirst({
            where: {
              OR: [
                { senderId: session.user.id, receiverId: contactId },
                { senderId: contactId, receiverId: session.user.id },
              ],
            },
            orderBy: { createdAt: "desc" },
          }),
          prisma.message.count({
            where: {
              senderId: contactId,
              receiverId: session.user.id,
              isRead: false,
            },
          }),
        ]);

        return { contact, lastMessage, unreadCount };
      })
    );

    conversations.sort(
      (a, b) =>
        new Date(b.lastMessage?.createdAt || 0).getTime() -
        new Date(a.lastMessage?.createdAt || 0).getTime()
    );

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Messages fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
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
    const validation = messageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId: validation.data.receiverId,
        content: validation.data.content,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Message send error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
