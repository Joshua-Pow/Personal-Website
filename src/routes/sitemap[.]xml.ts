import { createFileRoute } from "@tanstack/react-router";

import { SITE_URL } from "@/lib/site-metadata";

const routes = ["", "/history", "/adages", "/notes"];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const lastModified = new Date().toISOString();
        const urls = routes
          .map((route) => {
            const loc = `${SITE_URL}${route}`;
            const priority = route === "" ? "1.0" : "0.7";
            return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
          })
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
          },
        });
      },
    },
  },
});
