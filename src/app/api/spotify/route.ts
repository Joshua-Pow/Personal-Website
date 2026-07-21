import { getSpotifyData } from "@/lib/spotify";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getSpotifyData();
    return NextResponse.json(data, {
      headers: {
        // Keep this private so CDN/browsers don't serve stale auth failures.
        "Cache-Control": "private, max-age=0, s-maxage=0, must-revalidate",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Spotify API error:", message);
    return NextResponse.json(
      { error: "Failed to fetch Spotify data", detail: message },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
