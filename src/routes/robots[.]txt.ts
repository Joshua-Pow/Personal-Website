import { createFileRoute } from "@tanstack/react-router";

import { SITE_URL } from "@/lib/site-metadata";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () => {
        const body = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
          },
        });
      },
    },
  },
});
