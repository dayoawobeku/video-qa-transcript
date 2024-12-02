import { Message as AIMessage } from "ai";

export interface Message extends AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatHistory {
  messages: Message[];
}

export interface TranscriptData {
  text: string;
  duration: number;
  offset: number;
}
