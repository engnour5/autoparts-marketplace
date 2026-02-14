"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Conversation {
  contact: {
    id: string;
    name: string;
    avatar?: string | null;
    sellerProfile?: { shopName: string } | null;
  } | null;
  lastMessage: {
    content: string;
    createdAt: string;
  } | null;
  unreadCount: number;
}

export default function MessageList({
  conversations,
  selectedId,
  onSelect,
}: {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const t = useTranslations();

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        {t("messages.noMessages")}
      </div>
    );
  }

  return (
    <div className="divide-y">
      {conversations.map((conv) => {
        if (!conv.contact) return null;
        const displayName =
          conv.contact.sellerProfile?.shopName || conv.contact.name;

        return (
          <button
            key={conv.contact.id}
            onClick={() => onSelect(conv.contact!.id)}
            className={cn(
              "w-full p-4 text-left hover:bg-muted transition-colors flex items-center gap-3",
              selectedId === conv.contact.id && "bg-muted"
            )}
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium truncate">{displayName}</span>
                {conv.unreadCount > 0 && (
                  <Badge variant="default" className="ml-2">
                    {conv.unreadCount}
                  </Badge>
                )}
              </div>
              {conv.lastMessage && (
                <p className="text-sm text-muted-foreground truncate">
                  {conv.lastMessage.content}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
