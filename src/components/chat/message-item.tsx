"use client";

import { Message } from "ai";
import { User, Bot } from "lucide-react";

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`group relative flex gap-3 px-4 py-3 hover:bg-muted/50 items-center ${
        isUser ? "justify-end" : ""
      }`}
    >
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow-sm bg-background">
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className="space-y-2 items-end">
        <p className="text-sm">{message.content}</p>
      </div>
    </div>
  );
}
