"use client";

import { useState } from "react";
import { YoutubeIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageList } from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { Message } from "@/types/chat";

export default function VideoQAApp() {
  const [videoUrl, setVideoUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractVideoId = (url: string) => {
    const videoIdMatch = url.match(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return videoIdMatch ? videoIdMatch[1] : null;
  };

  const fetchYouTubeTranscript = async (videoId: string) => {
    try {
      const response = await fetch(
        `/api/youtube-transcript?videoId=${videoId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch transcript");
      }
      const data = await response.json();
      const fullTranscript = data
        .map((entry: { text: string }) => entry.text)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      if (!fullTranscript) {
        throw new Error("No transcript available for this video");
      }

      setTranscript(fullTranscript);
      return fullTranscript;
    } catch (error) {
      console.error("Error fetching YouTube transcript:", error);
      return null;
    }
  };

  const handleVideoProcess = async () => {
    setIsLoading(true);
    setTranscript("");
    setMessages([]);
    setError(null);

    try {
      let transcriptText = null;

      const videoId = extractVideoId(videoUrl);
      if (!videoId) {
        setError("Invalid YouTube URL");
        return;
      }

      transcriptText = await fetchYouTubeTranscript(videoId);

      if (!transcriptText) {
        throw new Error("Failed to generate transcript");
      }

      setTranscript(transcriptText);
    } catch (error) {
      console.error("Error processing video:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const performQA = async (question: string) => {
    setIsLoading(true);
    setError(null);

    const newMessage: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, newMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, newMessage],
          transcript,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate answer");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch (error) {
      console.error("Q&A error:", error);
      setError("Failed to generate an answer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl h-screen flex flex-col gap-4">
      <Card className="flex-shrink-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <YoutubeIcon className="h-6 w-6 text-red-600" />
            <h1 className="text-xl font-semibold">Video Q&A</h1>
          </div>

          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter YouTube Video URL"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
              <Button
                onClick={handleVideoProcess}
                disabled={!videoUrl || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Transcribe"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {transcript && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea readOnly value={transcript} className="h-40" />
            </CardContent>
          </Card>

          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
              <div className="flex-1 overflow-y-auto">
                <MessageList messages={messages} />
              </div>
              <ChatInput
                onSend={performQA}
                disabled={isLoading}
                placeholder="Ask a question about the video..."
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
