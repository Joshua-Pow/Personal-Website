import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SITE_REDIRECT_HOSTS, SITE_URL } from "@/lib/site-metadata";

const redirectHosts = new Set<string>(SITE_REDIRECT_HOSTS);

/**
 * Prefer joshuapow.ca as the canonical host.
 * Redirect .com (and www variants) with a 308 so Google consolidates ranking
 * signals onto .ca instead of treating them as alternate canonicals.
 *
 * Use the Edge `middleware` convention (not Next.js 16 `proxy.ts`): OpenNext
 * on Cloudflare does not support Node.js middleware/proxy yet.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();

  if (host && redirectHosts.has(host)) {
    const destination = new URL(
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
      SITE_URL,
    );
    return NextResponse.redirect(destination, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
