import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { formatLocation } from "@/lib/utils/geoUtils";

// Internal type for storage
type VisitorData = {
  visitorId?: string;
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

export async function POST(
  request: Request
): Promise<NextResponse<VisitorLocationResponse>> {
  try {
    // Get visitor ID from request body
    let visitorId: string | undefined;
    try {
      const body = (await request.json()) as { visitorId?: string };
      visitorId = body.visitorId;
    } catch {
      // No body or invalid JSON, continue without visitor ID
    }

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

      // Check if this is the same visitor (don't record twice)
      const isSameVisitor =
        visitorId && currentVisitorData?.visitorId === visitorId;

      if (isSameVisitor) {
        // Same visitor refreshing - just return existing previous visitor data
        previousVisitorData = localMemoryStore[PREVIOUS_VISITOR_KEY] || null;
      } else {
        // New visitor - move current to previous if it exists
        if (currentVisitorData) {
          localMemoryStore[PREVIOUS_VISITOR_KEY] = currentVisitorData;
        }

        // Create new visitor data
        const newVisitorData: VisitorData = {
          visitorId,
          location,
          latitude,
          longitude,
          timestamp: Date.now(),
        };

        // Update current visitor in memory
        localMemoryStore[CURRENT_VISITOR_KEY] = newVisitorData;

        // Get previous visitor data
        previousVisitorData = localMemoryStore[PREVIOUS_VISITOR_KEY] || null;
      }
    } else {
      // Use Cloudflare KV for production
      const kv = env.VISITOR_LOCATION;

      if (kv) {
        const [currentData, previousData] = await Promise.all([
          kv.get(CURRENT_VISITOR_KEY, "json"),
          kv.get(PREVIOUS_VISITOR_KEY, "json"),
        ]);
        currentVisitorData = currentData as VisitorData | null;

        const isSameVisitor =
          visitorId && currentVisitorData?.visitorId === visitorId;

        if (isSameVisitor) {
          previousVisitorData = previousData as VisitorData | null;
        } else {
          const newVisitorData: VisitorData = {
            visitorId,
            location,
            latitude,
            longitude,
            timestamp: Date.now(),
          };

          await Promise.all([
            currentVisitorData
              ? kv.put(
                  PREVIOUS_VISITOR_KEY,
                  JSON.stringify(currentVisitorData)
                )
              : Promise.resolve(),
            kv.put(CURRENT_VISITOR_KEY, JSON.stringify(newVisitorData)),
          ]);

          previousVisitorData = currentVisitorData;
        }
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
