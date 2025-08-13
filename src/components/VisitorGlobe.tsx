"use client";

import { useEffect, useState } from "react";
import Globe from "./Globe";
import { VisitorData } from "./LastVisitor";

export default function VisitorGlobe() {
  const [visitorData, setVisitorData] = useState<VisitorData>();

  useEffect(() => {
    async function fetchVisitorInfo() {
      try {
        // Record the current visitor's location, which will return previous visitor info
        const recordResponse = await fetch("/api/visitor-location", {
          method: "POST",
        });

        if (recordResponse.ok) {
          const data = await recordResponse.json();

          // Prefer previous visitor data if available, otherwise use current visitor data
          if (data.previousLocation) {
            setVisitorData({
              location: data.previousLocation,
              latitude: data.previousLatitude,
              longitude: data.previousLongitude,
            });
          } else {
            setVisitorData(undefined);
          }
        }
      } catch (error) {
        console.error("Error with visitor location:", error);
        // Keep default coordinates but update location text
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
      {visitorData && (
        <div className="mt-2 text-center text-xs text-neutral-400 opacity-50 transition-opacity hover:opacity-100">
          <p>Last visitor was from {visitorData.location}</p>
        </div>
      )}
    </div>
  );
}
