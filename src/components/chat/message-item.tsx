"use client";

import { User, Bot } from "lucide-react";
import { Message } from "@/types/chat";
import { Card, CardContent } from "@/components/ui/card";

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex gap-3 max-w-[80%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow">
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>
        <Card className={isUser ? "bg-primary text-primary-foreground" : ""}>
          <CardContent className="p-3">
            <p className="text-sm">{message.content}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
