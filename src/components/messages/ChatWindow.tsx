"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: { id: string; name: string };
}

export default function ChatWindow({ contactId }: { contactId: string }) {
  const t = useTranslations();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contactId) return;

    async function fetchMessages() {
      const res = await fetch(`/api/messages?with=${contactId}`);
      const data = await res.json();
      setMessages(data);
    }

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [contactId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: contactId,
          content: newMessage.trim(),
        }),
      });

      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Send error:", error);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isOwn = msg.senderId === session?.user?.id;
          return (
            <div
              key={msg.id}
              className={cn("flex", isOwn ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[70%] rounded-lg px-4 py-2",
                  isOwn
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p className="text-sm">{msg.content}</p>
                <p
                  className={cn(
                    "text-xs mt-1",
                    isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t p-4 flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={t("messages.typeMessage")}
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
