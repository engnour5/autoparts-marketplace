"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import MessageList from "@/components/messages/MessageList";
import ChatWindow from "@/components/messages/ChatWindow";

interface Conversation {
  contact: {
    id: string;
    name: string;
    avatar?: string | null;
    sellerProfile?: { shopName: string } | null;
  } | null;
  lastMessage: { content: string; createdAt: string } | null;
  unreadCount: number;
}

export default function MessagesPage() {
  const t = useTranslations();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string>(
    searchParams.get("to") || ""
  );

  useEffect(() => {
    async function fetchConversations() {
      const res = await fetch("/api/messages");
      const data = await res.json();
      setConversations(data);
    }

    if (session?.user) {
      fetchConversations();
    }
  }, [session]);

  // Auto-select from URL param
  useEffect(() => {
    const to = searchParams.get("to");
    if (to) setSelectedId(to);
  }, [searchParams]);

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">
          Please login to view messages.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t("messages.title")}</h1>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
          {/* Conversation list */}
          <div className="border-r overflow-y-auto">
            <div className="p-4 border-b font-semibold">
              {t("messages.conversations")}
            </div>
            <MessageList
              conversations={conversations}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>

          {/* Chat window */}
          <div className="col-span-2">
            {selectedId ? (
              <ChatWindow contactId={selectedId} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {t("messages.noMessages")}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
