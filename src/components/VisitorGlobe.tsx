"use client";

import { useEffect, useState } from "react";
import Globe from "./Globe";
import { VisitorData } from "./LastVisitor";
import type { VisitorLocationResponse } from "@/app/api/visitor-location/route";

export default function VisitorGlobe() {
  const [visitorData, setVisitorData] = useState<VisitorData | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchVisitorInfo() {
      try {
        // Record the current visitor's location, which will return previous visitor info
        const recordResponse = await fetch("/api/visitor-location", {
          method: "POST",
        });

        if (!recordResponse.ok) {
          throw new Error(`HTTP error! status: ${recordResponse.status}`);
        }

        const data: VisitorLocationResponse = await recordResponse.json();

        // Prefer previous visitor data if available, otherwise use current visitor data
        if (
          data.previousLocation &&
          data.previousLatitude &&
          data.previousLongitude
        ) {
          setVisitorData({
            location: data.previousLocation,
            latitude: data.previousLatitude,
            longitude: data.previousLongitude,
          });
        } else {
          // No previous visitor data available
          setVisitorData(undefined);
        }
      } catch (error) {
        console.error("Error fetching visitor location:", error);
        // Set undefined to hide the visitor data on error
        setVisitorData(undefined);
      } finally {
        setIsLoading(false);
      }
    }

    fetchVisitorInfo();
  }, []);

  return (
    <div className="mb-8 flex flex-col items-center justify-center">
      {/* Fixed size container for the globe */}
      <div className="motion-preset-focus-lg flex h-[300px] w-[300px] items-center justify-center motion-opacity-in-[0%] motion-duration-1000 motion-ease-in">
        <Globe visitorData={visitorData} />
      </div>
      {!isLoading && visitorData && (
        <div className="mt-2 text-center text-xs text-neutral-400 opacity-50 transition-opacity hover:opacity-100">
          <p>Last visitor was from {visitorData.location}</p>
        </div>
      )}
    </div>
  );
}
