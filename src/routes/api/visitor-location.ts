import { createFileRoute } from "@tanstack/react-router";

import { getRequestCf, getWorkerEnv } from "@/lib/cf";
import { getCountryFlag } from "@/lib/country-flag";
import { formatLocation } from "@/lib/utils/geo-utils";
import type { VisitorLocationResponse } from "@/lib/visitor-location";

interface StoredVisitor {
  visitorId?: string;
  location: string;
  latitude?: string;
  longitude?: string;
  timestamp: number;
}

interface ResolvedLocation {
  location: string;
  latitude?: string;
  longitude?: string;
}

const CURRENT_VISITOR_KEY = "current-visitor";
const PREVIOUS_VISITOR_KEY = "previous-visitor";
const localMemoryStore: Record<string, StoredVisitor> = {};

function jsonResponse(body: VisitorLocationResponse) {
  return Response.json(body);
}

function isObjectValue(value: unknown): value is object {
  return value !== null && Object(value) === value && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isStoredVisitor(value: unknown): value is StoredVisitor {
  if (!isObjectValue(value)) {
    return false;
  }
  if (!("location" in value) || !("timestamp" in value)) {
    return false;
  }
  if (!isString(value.location) || !isFiniteNumber(value.timestamp)) {
    return false;
  }
  if (
    "visitorId" in value &&
    value.visitorId !== undefined &&
    !isString(value.visitorId)
  ) {
    return false;
  }
  if (
    "latitude" in value &&
    value.latitude !== undefined &&
    !isString(value.latitude)
  ) {
    return false;
  }
  if (
    "longitude" in value &&
    value.longitude !== undefined &&
    !isString(value.longitude)
  ) {
    return false;
  }
  return true;
}

async function readVisitorId(request: Request): Promise<string | undefined> {
  try {
    const body: unknown = await request.json();
    if (!isObjectValue(body) || !("visitorId" in body)) {
      return;
    }
    return isString(body.visitorId) ? body.visitorId : undefined;
  } catch {
    // No body or invalid JSON, continue without visitor ID
  }
}

function mockTorontoLocation(): ResolvedLocation {
  return {
    location: formatLocation({
      city: "Toronto",
      country: "CA",
      countryRegion: "ON",
      flag: "🇨🇦",
    }),
    latitude: "43.6532",
    longitude: "-79.3832",
  };
}

function locationFromRequest(request: Request): ResolvedLocation {
  const cf = getRequestCf(request);
  return {
    location: formatLocation({
      city: cf?.city,
      country: cf?.country,
      countryRegion: cf?.region,
      flag: getCountryFlag(cf?.country),
    }),
    latitude: cf?.latitude,
    longitude: cf?.longitude,
  };
}

function persistLocalVisitor(
  visitorId: string | undefined,
  nextVisitor: StoredVisitor
): StoredVisitor | null {
  const currentVisitor = localMemoryStore[CURRENT_VISITOR_KEY] ?? null;
  const isSameVisitor = Boolean(
    visitorId && currentVisitor?.visitorId === visitorId
  );

  if (!isSameVisitor) {
    if (currentVisitor) {
      localMemoryStore[PREVIOUS_VISITOR_KEY] = currentVisitor;
    }
    localMemoryStore[CURRENT_VISITOR_KEY] = nextVisitor;
  }

  return localMemoryStore[PREVIOUS_VISITOR_KEY] ?? null;
}

async function persistKvVisitor(
  visitorId: string | undefined,
  nextVisitor: StoredVisitor
): Promise<StoredVisitor | null> {
  const kv = getWorkerEnv().VISITOR_LOCATION;
  if (!kv) {
    return null;
  }

  const [currentData, previousData] = await Promise.all([
    kv.get(CURRENT_VISITOR_KEY, "json"),
    kv.get(PREVIOUS_VISITOR_KEY, "json"),
  ]);
  const currentVisitor = isStoredVisitor(currentData) ? currentData : null;
  const isSameVisitor = Boolean(
    visitorId && currentVisitor?.visitorId === visitorId
  );

  if (isSameVisitor) {
    return isStoredVisitor(previousData) ? previousData : null;
  }

  await Promise.all([
    currentVisitor
      ? kv.put(PREVIOUS_VISITOR_KEY, JSON.stringify(currentVisitor))
      : Promise.resolve(),
    kv.put(CURRENT_VISITOR_KEY, JSON.stringify(nextVisitor)),
  ]);

  return currentVisitor;
}

export const Route = createFileRoute("/api/visitor-location")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const visitorId = await readVisitorId(request);
          const { location, latitude, longitude } = import.meta.env.DEV
            ? mockTorontoLocation()
            : locationFromRequest(request);

          const nextVisitor: StoredVisitor = {
            visitorId,
            location,
            latitude,
            longitude,
            timestamp: Date.now(),
          };

          const previousVisitor = import.meta.env.DEV
            ? persistLocalVisitor(visitorId, nextVisitor)
            : await persistKvVisitor(visitorId, nextVisitor);

          if (!previousVisitor) {
            return jsonResponse({ currentLocation: location });
          }

          return jsonResponse({
            currentLocation: location,
            previousLocation: previousVisitor.location,
            previousLatitude: previousVisitor.latitude,
            previousLongitude: previousVisitor.longitude,
          });
        } catch (error) {
          console.error("Error handling visitor location:", error);
          return jsonResponse({ currentLocation: "unknown location" });
        }
      },
    },
  },
});
