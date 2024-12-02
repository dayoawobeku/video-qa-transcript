import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");

  if (!videoId) {
    return NextResponse.json(
      { error: "Video ID is required" },
      { status: 400 }
    );
  }

  try {
    const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);

    return NextResponse.json(transcriptData);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch transcript",
        details: error instanceof Error ? error.message : "Unknown error",
        fullError: error,
      },
      { status: 500 }
    );
  }
}
