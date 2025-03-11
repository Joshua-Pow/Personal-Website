import { NextResponse } from "next/server";
import { geolocation } from "@vercel/functions";
import { formatLocation } from "@/lib/geoUtils";

// In-memory storage for previous visitor location
let previousVisitorLocation: string | null = null;
// In-memory storage for current visitor location
let currentVisitorLocation: string | null = null;

export async function GET() {
  // Return previous visitor's location if available
  if (previousVisitorLocation) {
    return NextResponse.json({ location: previousVisitorLocation });
  }

  // Default response if no previous visitor has been recorded yet
  return NextResponse.json({ location: "somewhere on Earth" });
}

export async function POST(request: Request) {
  // Get geo information using Vercel's helper
  const geo = geolocation(request);

  // Format the location string using our utility
  const location = formatLocation(geo);

  // Move current visitor to previous visitor
  if (currentVisitorLocation) {
    previousVisitorLocation = currentVisitorLocation;
  }

  // Update the current visitor location
  currentVisitorLocation = location;

  return NextResponse.json({
    success: true,
    currentLocation: location,
    previousLocation: previousVisitorLocation || "nowhere yet",
  });
}
