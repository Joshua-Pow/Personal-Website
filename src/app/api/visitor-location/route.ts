import { NextResponse } from "next/server";
import { geolocation } from "@vercel/functions";
import { formatLocation } from "@/lib/geoUtils";

// In-memory storage for previous visitor location data
type VisitorData = {
  location: string;
  latitude?: string;
  longitude?: string;
};

let previousVisitorData: VisitorData | null = null;
let currentVisitorData: VisitorData | null = null;

export async function GET() {
  // Return previous visitor's location if available
  if (previousVisitorData) {
    return NextResponse.json(previousVisitorData);
  }

  // Default response if no previous visitor has been recorded yet
  return NextResponse.json({
    location: "somewhere on Earth",
    latitude: "0",
    longitude: "0",
  });
}

export async function POST(request: Request) {
  // Get geo information using Vercel's helper
  const geo = geolocation(request);

  // Format the location string using our utility
  const location = formatLocation(geo);

  // Extract coordinates
  const latitude = geo.latitude;
  const longitude = geo.longitude;

  // Move current visitor to previous visitor
  if (currentVisitorData) {
    previousVisitorData = currentVisitorData;
  }

  // Update the current visitor data
  currentVisitorData = {
    location,
    latitude,
    longitude,
  };

  return NextResponse.json({
    success: true,
    currentLocation: location,
    previousLocation: previousVisitorData?.location || "nowhere yet",
    previousLatitude: previousVisitorData?.latitude || "0",
    previousLongitude: previousVisitorData?.longitude || "0",
  });
}
