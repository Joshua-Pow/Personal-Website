import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
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

export async function POST(): Promise<NextResponse<VisitorLocationResponse>> {
  try {
    // Get Cloudflare context for geolocation and KV access
    const { env, cf } = getCloudflareContext();

    let location: string;
    let latitude: string | undefined;
    let longitude: string | undefined;

    if (isLocalDevelopment) {
      // Mock location as Toronto, Canada for local development
      const mockGeo = {
        city: "Toronto",
        country: "CA",
        countryRegion: "ON",
        flag: "🇨🇦",
      };
      location = formatLocation(mockGeo);
      latitude = "43.6532";
      longitude = "-79.3832";
    } else {
      // Get geo information from Cloudflare's cf object
      // cf object contains: city, country, region, latitude, longitude, etc.
      const geo = {
        city: cf?.city,
        country: cf?.country,
        countryRegion: cf?.region,
        flag: getCountryFlag(cf?.country),
      };
      location = formatLocation(geo);
      latitude = cf?.latitude;
      longitude = cf?.longitude;
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
      const kv = env.VISITOR_LOCATION;

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

// Helper function to get country flag emoji from country code
function getCountryFlag(countryCode?: string): string {
  if (!countryCode) return "";

  // Convert country code to flag emoji
  // Each country code letter maps to a regional indicator symbol
  const codePoints = [...countryCode.toUpperCase()].map(
    (char) => 127397 + char.charCodeAt(0)
  );
  return String.fromCodePoint(...codePoints);
}
