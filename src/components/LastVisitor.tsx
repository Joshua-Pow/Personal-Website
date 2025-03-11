"use client";

import { useEffect, useState } from "react";

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
        // Record the current visitor's location, which will return previous visitor info
        const recordResponse = await fetch("/api/visitor-location", {
          method: "POST",
        });

        if (recordResponse.ok) {
          const data = await recordResponse.json();
          // Extract data for previous visitor
          setPreviousVisitorData({
            location: data.previousLocation,
            latitude: data.previousLatitude || "0",
            longitude: data.previousLongitude || "0",
          });
        }
      } catch (error) {
        console.error("Error with visitor location:", error);
        setPreviousVisitorData({
          location: "somewhere on Earth",
          latitude: "0",
          longitude: "0",
        });
      } finally {
        setIsLoading(false);
      }
    }

    recordAndFetchVisitorInfo();
  }, []);

  if (
    isLoading ||
    !previousVisitorData ||
    previousVisitorData.location === "nowhere yet"
  ) {
    return null; // Don't show anything while loading or if there's no previous visitor
  }

  return (
    <div className="mt-4 text-xs text-neutral-400 opacity-50 transition-opacity hover:opacity-100">
      <p>Last visitor was from {previousVisitorData.location}</p>
    </div>
  );
}
