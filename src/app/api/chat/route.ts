import { NextRequest, NextResponse } from "next/server";
import { Message } from "@/types/chat";

export async function POST(request: NextRequest) {
  try {
    const { messages, transcript } = await request.json();

    if (!messages || !transcript) {
      return NextResponse.json(
        { error: "Messages and transcript are required" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
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
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate answer");
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error("No answer generated");
    }

    return NextResponse.json({ answer: data.choices[0].message.content });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to generate answer" },
      { status: 500 }
    );
  }
}
