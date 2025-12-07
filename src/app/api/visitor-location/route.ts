import { NextResponse } from "next/server";
import { type Geo, geolocation } from "@vercel/functions";
import { formatLocation } from "@/lib/utils/geoUtils";

// Internal type for storage
type VisitorData = {
  location: string;
  latitude?: string;
  longitude?: string;
  timestamp: number;
};

// Exported API response type
export type VisitorLocationResponse = {
  currentLocation: string;
  previousLocation?: string;
  previousLatitude?: string;
  previousLongitude?: string;
};

// Determine if we're running in local development
const isLocalDevelopment = process.env.NODE_ENV === "development";

// Simple in-memory storage for local development
const localMemoryStore: { [key: string]: VisitorData } = {};

// Storage keys
const CURRENT_VISITOR_KEY = "current-visitor";
const PREVIOUS_VISITOR_KEY = "previous-visitor";

// Helper to get KV namespace from the request context
function getKV(request: Request): KVNamespace | null {
  // In Cloudflare Workers with OpenNext, bindings are available via the env
  // @ts-expect-error - OpenNext Cloudflare binding access
  const env = request.env;
  return env?.VISITOR_LOCATION || null;
}

export async function POST(
  request: Request
): Promise<NextResponse<VisitorLocationResponse>> {
  try {
    let geo: Geo;
    let location: ReturnType<typeof formatLocation>;
    let latitude: Geo["latitude"];
    let longitude: Geo["longitude"];

    if (isLocalDevelopment) {
      // Mock location as Toronto, Canada for local development
      geo = {
        city: "Toronto",
        country: "CA",
        countryRegion: "ON",
        flag: "🇨🇦",
        latitude: "43.6532",
        longitude: "-79.3832",
      };
      location = formatLocation(geo);
      latitude = geo.latitude;
      longitude = geo.longitude;
    } else {
      // Get geo information using Vercel's helper in production
      geo = geolocation(request);
      location = formatLocation(geo);
      latitude = geo.latitude;
      longitude = geo.longitude;
    }

    let currentVisitorData: VisitorData | null = null;
    let previousVisitorData: VisitorData | null = null;

    if (isLocalDevelopment) {
      // Use in-memory storage for local development
      currentVisitorData = localMemoryStore[CURRENT_VISITOR_KEY] || null;

      // Move current to previous if it exists
      if (currentVisitorData) {
        localMemoryStore[PREVIOUS_VISITOR_KEY] = currentVisitorData;
      }

      // Create new visitor data
      const newVisitorData: VisitorData = {
        location,
        latitude,
        longitude,
        timestamp: Date.now(),
      };

      // Update current visitor in memory
      localMemoryStore[CURRENT_VISITOR_KEY] = newVisitorData;

      // Get previous visitor data
      previousVisitorData = localMemoryStore[PREVIOUS_VISITOR_KEY] || null;
    } else {
      // Use Cloudflare KV for production
      const kv = getKV(request);

      if (kv) {
        // Get current visitor data
        const currentData = await kv.get(CURRENT_VISITOR_KEY, "json");
        currentVisitorData = currentData as VisitorData | null;

        // Move current visitor to previous visitor if it exists
        if (currentVisitorData) {
          await kv.put(
            PREVIOUS_VISITOR_KEY,
            JSON.stringify(currentVisitorData)
          );
        }

        // Create new visitor data with timestamp
        const newVisitorData: VisitorData = {
          location,
          latitude,
          longitude,
          timestamp: Date.now(),
        };

        // Update the current visitor data in KV
        await kv.put(CURRENT_VISITOR_KEY, JSON.stringify(newVisitorData));

        // Get the previous visitor data for the response
        const previousData = await kv.get(PREVIOUS_VISITOR_KEY, "json");
        previousVisitorData = previousData as VisitorData | null;
      }
    }

    if (!previousVisitorData) {
      return NextResponse.json({
        currentLocation: location,
      });
    }

    return NextResponse.json({
      currentLocation: location,
      previousLocation: previousVisitorData.location,
      previousLatitude: previousVisitorData.latitude,
      previousLongitude: previousVisitorData.longitude,
    });
  } catch (error) {
    console.error("Error handling visitor location:", error);

    // Fallback response on error
    return NextResponse.json({
      currentLocation: "unknown location",
    });
  }
}
