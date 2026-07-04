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
    return NextResponse.json(preview);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch preview";

    if (message === "Invalid URL" || message === "URL not allowed") {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    try {
      return NextResponse.json(buildFallbackPreview(url));
    } catch {
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }
}
