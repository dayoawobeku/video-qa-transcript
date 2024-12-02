"use client";

import { useState } from "react";
import { useChat } from "ai/react";
import { YoutubeIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageList } from "@/components/chat/message-list";

const extractVideoId = (url: string) => {
  const videoIdMatch = url.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return videoIdMatch ? videoIdMatch[1] : null;
};

export default function VideoQAApp() {
  const [videoUrl, setVideoUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    messages,
    input,
    handleSubmit,
    handleInputChange,
    isLoading: isChatLoading,
  } = useChat({
    body: {
      transcript,
    },
  });

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
        <div className="flex flex-col flex-grow h-[calc(100vh-200px)] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Card className="h-40 md:h-full">
              <CardContent className="p-4 h-full">
                <div className="flex flex-col h-full">
                  <h2 className="text-sm font-medium mb-2">Transcript</h2>
                  <Textarea
                    readOnly
                    value={transcript}
                    className="flex-grow resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardContent className="p-0 flex-grow flex flex-col h-[calc(100vh-280px)]">
                <div className="flex-grow overflow-y-auto">
                  <MessageList messages={messages} />
                </div>
                <form onSubmit={handleSubmit} className="border-t p-4">
                  <div className="flex space-x-2">
                    <Input
                      value={input}
                      onChange={handleInputChange}
                      placeholder="Ask a question about the video..."
                      disabled={isChatLoading}
                    />
                    <Button type="submit" disabled={isChatLoading}>
                      {isChatLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Send"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
