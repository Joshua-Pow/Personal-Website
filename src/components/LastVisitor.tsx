"use client";

import { useEffect, useState } from "react";
import type { VisitorLocationResponse } from "@/app/api/visitor-location/route";
import { getOrCreateVisitorId } from "@/lib/visitor-id";

export type VisitorData = {
  location: string;
  latitude: string;
  longitude: string;
};

export default function LastVisitor() {
  const [previousVisitorData, setPreviousVisitorData] =
    useState<VisitorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function recordAndFetchVisitorInfo() {
      try {
        const visitorId = getOrCreateVisitorId();

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
          setPreviousVisitorData(null);
        }
      } catch (error) {
        console.error("Error fetching visitor location:", error);
        setPreviousVisitorData(null);
      } finally {
        setIsLoading(false);
      }
    }

    recordAndFetchVisitorInfo();
  }, []);

  if (isLoading || !previousVisitorData) {
    return null;
  }

  return (
    <div className="mt-4 text-xs text-subtle motion-reduce:transition-none transition-opacity hover:text-accent">
      <p>Last visitor was from {previousVisitorData.location}</p>
    </div>
  );
}
