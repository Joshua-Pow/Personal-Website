import { createFileRoute } from "@tanstack/react-router";

import { getSpotifyData } from "@/lib/spotify";

export const Route = createFileRoute("/api/spotify")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const data = await getSpotifyData();
          return Response.json(data, {
            headers: {
              "Cache-Control":
                "private, max-age=0, s-maxage=0, must-revalidate",
            },
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          console.error("Spotify API error:", message);
          return Response.json(
            { error: "Failed to fetch Spotify data", detail: message },
            {
              status: 500,
              headers: {
                "Cache-Control": "no-store",
              },
            }
          );
        }
      },
    },
  },
});
