import { getOrCreateVisitorId } from "@/lib/visitor-id";

export interface VisitorData {
  location: string;
  latitude: string;
  longitude: string;
}

export interface VisitorLocationResponse {
  currentLocation: string;
  previousLocation?: string;
  previousLatitude?: string;
  previousLongitude?: string;
}

export const visitorLocationQueryKey = ["visitor-location"] as const;

export async function fetchVisitorLocation(): Promise<VisitorLocationResponse> {
  const visitorId = getOrCreateVisitorId();
  const response = await fetch("/api/visitor-location", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ visitorId }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export function selectPreviousVisitor(
  data: VisitorLocationResponse
): VisitorData | undefined {
  if (
    data.previousLocation &&
    data.previousLatitude &&
    data.previousLongitude
  ) {
    return {
      location: data.previousLocation,
      latitude: data.previousLatitude,
      longitude: data.previousLongitude,
    };
  }

  return undefined;
}
