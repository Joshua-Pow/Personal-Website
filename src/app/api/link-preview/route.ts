import { buildFallbackPreview, fetchLinkPreview } from "@/lib/link-preview";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const preview = await fetchLinkPreview(url);
    return NextResponse.json(preview, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch preview";

    if (message === "Invalid URL" || message === "URL not allowed") {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    try {
      return NextResponse.json(buildFallbackPreview(url), {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      });
    } catch {
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }
}
