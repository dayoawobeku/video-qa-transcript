"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/types/chat";
import { MessageItem } from "./message-item";

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col space-y-4 p-4">
      {messages.map((message, index) => (
        <MessageItem key={index} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
