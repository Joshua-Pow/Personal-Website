import handler from "@tanstack/react-start/server-entry";

import { SITE_REDIRECT_HOSTS, SITE_URL } from "@/lib/site-metadata";

const redirectHosts = new Set<string>(SITE_REDIRECT_HOSTS);

export default {
  fetch(request: Request) {
    const host = new URL(request.url).hostname.toLowerCase();

    if (redirectHosts.has(host)) {
      const url = new URL(request.url);
      return Response.redirect(`${SITE_URL}${url.pathname}${url.search}`, 308);
    }

    return handler.fetch(request);
  },
};
