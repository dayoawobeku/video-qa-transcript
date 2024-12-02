import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");

  console.log("Vercel Environment Logs:");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("VERCEL_REGION:", process.env.VERCEL_REGION);
  console.log("Attempting to fetch transcript for videoId:", videoId);

  if (!videoId) {
    return NextResponse.json(
      { error: "Video ID is required" },
      { status: 400 }
    );
  }

  try {
    console.log("Attempting YoutubeTranscript.fetchTranscript()");

    const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);

    console.log("Transcript fetch successful:", transcriptData.length);

    return NextResponse.json(transcriptData);
  } catch (error) {
    console.error("FULL ERROR DETAILS:", error);

    if (error instanceof Error) {
      console.error("Error Name:", error.name);
      console.error("Error Message:", error.message);
      console.error("Error Stack:", error.stack);
    }

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
