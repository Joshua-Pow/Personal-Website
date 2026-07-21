import { getSpotifyData } from "@/lib/spotify";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getSpotifyData();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Spotify API error:", message);
    return NextResponse.json(
      { error: "Failed to fetch Spotify data", detail: message },
      { status: 500 }
    );
  }
}
