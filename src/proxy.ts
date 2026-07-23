import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SITE_URL } from "@/lib/site-metadata";

const canonicalHost = new URL(SITE_URL).host;

/**
 * Prefer a single hostname so Google does not treat www + apex as duplicates.
 * Canonical tags alone produce "Alternate page with proper canonical tag" in GSC;
 * a 308 consolidates signals onto the preferred host.
 */
export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();

  if (host === `www.${canonicalHost}`) {
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
