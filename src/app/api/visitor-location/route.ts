import { NextResponse } from "next/server";
import { geolocation } from "@vercel/functions";

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
  const { city, region, country } = geolocation(request);

  // Format the location string
  let location = country || "unknown country";
  if (city) {
    location = city + (region ? `, ${region}` : "") + `, ${location}`;
  } else if (region) {
    location = `${region}, ${location}`;
  }

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
