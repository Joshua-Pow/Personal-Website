import { createFileRoute } from "@tanstack/react-router";

import { buildFallbackPreview, fetchLinkPreview } from "@/lib/link-preview";

export const Route = createFileRoute("/api/link-preview")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get("url");

        if (!url) {
          return Response.json(
            { error: "Missing url parameter" },
            { status: 400 }
          );
        }

        try {
          const preview = await fetchLinkPreview(url);
          return Response.json(preview, {
            headers: {
              "Cache-Control":
                "public, s-maxage=300, stale-while-revalidate=600",
            },
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to fetch preview";

          if (message === "Invalid URL" || message === "URL not allowed") {
            return Response.json({ error: message }, { status: 400 });
          }

          try {
            return Response.json(buildFallbackPreview(url), {
              headers: {
                "Cache-Control":
                  "public, s-maxage=300, stale-while-revalidate=600",
              },
            });
          } catch {
            return Response.json({ error: message }, { status: 502 });
          }
        }
      },
    },
  },
});
