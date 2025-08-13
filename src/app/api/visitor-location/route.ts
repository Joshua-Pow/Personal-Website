import { NextResponse } from "next/server";
import { type Geo, geolocation } from "@vercel/functions";
import { formatLocation } from "@/lib/utils/geoUtils";
import { Redis } from "@upstash/redis";

// Type definitions for visitor data
type VisitorData = {
  location: string;
  latitude?: string;
  longitude?: string;
  timestamp: number;
};

export type VisitorLocationResponse = {
  currentLocation: string;
  previousLocation?: string;
  previousLatitude?: string;
  previousLongitude?: string;
};

// Determine if we're running in local development
const isLocalDevelopment = process.env.NODE_ENV === "development";

// Initialize Redis client for production only
const redis = !isLocalDevelopment
  ? new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    })
  : null;

// Simple in-memory storage for local development
const localMemoryStore: { [key: string]: VisitorData } = {};

// Storage keys
const CURRENT_VISITOR_KEY = "current-visitor";
const PREVIOUS_VISITOR_KEY = "previous-visitor";

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
      // Use Redis for production
      currentVisitorData = await redis!.get<VisitorData>(CURRENT_VISITOR_KEY);

      // Move current visitor to previous visitor if it exists
      if (currentVisitorData) {
        await redis!.set(PREVIOUS_VISITOR_KEY, currentVisitorData);
      }

      // Create new visitor data with timestamp
      const newVisitorData: VisitorData = {
        location,
        latitude,
        longitude,
        timestamp: Date.now(),
      };

      // Update the current visitor data in Redis
      await redis!.set(CURRENT_VISITOR_KEY, newVisitorData);

      // Get the previous visitor data for the response
      previousVisitorData = await redis!.get<VisitorData>(PREVIOUS_VISITOR_KEY);
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
