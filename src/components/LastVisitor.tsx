"use client";

import { useEffect, useState } from "react";
import type { VisitorLocationResponse } from "@/app/api/visitor-location/route";

export type VisitorData = {
  location: string;
  latitude: string;
  longitude: string;
};

const VISITOR_ID_KEY = "visitor-id";

function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";

  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

export default function LastVisitor() {
  const [previousVisitorData, setPreviousVisitorData] =
    useState<VisitorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function recordAndFetchVisitorInfo() {
      try {
        const visitorId = getOrCreateVisitorId();

        // Record the current visitor's location, which will return previous visitor info
        const recordResponse = await fetch("/api/visitor-location", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ visitorId }),
        });

        if (!recordResponse.ok) {
          throw new Error(`HTTP error! status: ${recordResponse.status}`);
        }

        const data: VisitorLocationResponse = await recordResponse.json();

        // Extract data for previous visitor if available
        if (
          data.previousLocation &&
          data.previousLatitude &&
          data.previousLongitude
        ) {
          setPreviousVisitorData({
            location: data.previousLocation,
            latitude: data.previousLatitude,
            longitude: data.previousLongitude,
          });
        } else {
          // No previous visitor data available
          setPreviousVisitorData(null);
        }
      } catch (error) {
        console.error("Error fetching visitor location:", error);
        // Set null to hide the component on error
        setPreviousVisitorData(null);
      } finally {
        setIsLoading(false);
      }
    }

    recordAndFetchVisitorInfo();
  }, []);

  if (isLoading || !previousVisitorData) {
    return null; // Don't show anything while loading or if there's no previous visitor
  }

  return (
    <div className="mt-4 text-xs text-neutral-400 opacity-50 transition-opacity hover:opacity-100">
      <p>Last visitor was from {previousVisitorData.location}</p>
    </div>
  );
}
