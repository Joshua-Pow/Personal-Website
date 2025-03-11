"use client";

import { useEffect, useState } from "react";
import Globe from "./Globe";
import { VisitorData } from "./LastVisitor";

export default function VisitorGlobe() {
  const [visitorData, setVisitorData] = useState<VisitorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    async function fetchVisitorInfo() {
      try {
        // Record the current visitor's location, which will return previous visitor info
        const recordResponse = await fetch("/api/visitor-location", {
          method: "POST",
        });

        if (recordResponse.ok) {
          const data = await recordResponse.json();
          // Extract data for previous visitor
          setVisitorData({
            location: data.previousLocation,
            latitude: data.previousLatitude || "0",
            longitude: data.previousLongitude || "0",
          });
        }
      } catch (error) {
        console.error("Error with visitor location:", error);
        setVisitorData({
          location: "somewhere on Earth",
          latitude: "0",
          longitude: "0",
        });
      } finally {
        setIsLoading(false);
        // Add a delay before showing the globe to let other animations complete
        setTimeout(() => setIsVisible(true), 6000);
      }
    }

    fetchVisitorInfo();
  }, []);

  if (
    isLoading ||
    !visitorData ||
    visitorData.location === "nowhere yet" ||
    !isVisible
  ) {
    return null; // Don't show anything while loading or if there's no previous visitor
  }

  return (
    <div className="mb-8 flex flex-col items-center justify-center">
      {/* Fixed size container for the globe */}
      <div className="motion-preset-focus-lg flex h-[300px] w-[300px] items-center justify-center motion-opacity-in-[0%] motion-duration-1000 motion-ease-in">
        <Globe visitorData={visitorData} />
      </div>
      <div className="mt-2 text-center text-xs text-neutral-400 opacity-50 transition-opacity hover:opacity-100">
        <p>Last visitor was from {visitorData.location}</p>
      </div>
    </div>
  );
}
