import { NextRequest } from "next/server";
import { Message } from "@/types/chat";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(request: NextRequest) {
  try {
    const { messages, transcript } = await request.json();

    if (!messages || !transcript) {
      return new Response(
        JSON.stringify({ error: "Messages and transcript are required" }),
        { status: 400 }
      );
    }

    const formattedMessages = [
      {
        role: "system",
        content:
          "You are a helpful assistant that answers questions based on a given transcript. If the answer is not in the transcript, say you cannot find the information.",
      },
      ...messages.map((msg: Message) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user",
        content: `Here is the transcript to reference: ${transcript}\n\nPlease provide a concise and direct answer based strictly on the transcript.`,
      },
    ];

    const result = streamText({
      model: openai("gpt-4o"),
      system:
        "You are a helpful assistant that answers questions based on a given transcript. If the answer is not in the transcript, say you cannot find the information.",
      messages: formattedMessages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate answer" }),
      { status: 500 }
    );
  }
}
