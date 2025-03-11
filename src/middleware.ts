import { NextResponse, type NextRequest } from "next/server";

// Simple in-memory storage for the last visitor's location
// In a production environment, you'd want to use a database
let lastVisitorLocation: string | null = null;

export function middleware(request: NextRequest) {
  // Get IP geolocation data from request headers
  // Vercel automatically adds these headers when deployed
  const countryHeader = request.headers.get("x-vercel-ip-country");
  const cityHeader = request.headers.get("x-vercel-ip-city");
  const regionHeader = request.headers.get("x-vercel-ip-country-region");

  const country = countryHeader || "unknown country";
  const city = cityHeader || "";
  const region = regionHeader || "";

  // Format the location string
  let location = country;
  if (city) {
    location = city + (region ? `, ${region}` : "") + `, ${country}`;
  } else if (region) {
    location = `${region}, ${country}`;
  }

  // Update the last visitor location
  lastVisitorLocation = location;

  // Continue with the request
  return NextResponse.next();
}

// Specify which paths the middleware should run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

// Export the location data for use in the API
export function getLastVisitorLocation() {
  return lastVisitorLocation || "somewhere on Earth";
}
