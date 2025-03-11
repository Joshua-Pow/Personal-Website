"use client";

import { useEffect, useState } from "react";

export default function LastVisitor() {
  const [previousVisitorLocation, setPreviousVisitorLocation] = useState<
    string | null
  >(null);
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
          // The previousLocation property contains the location of the previous visitor, not the current one
          setPreviousVisitorLocation(data.previousLocation);
        }
      } catch (error) {
        console.error("Error with visitor location:", error);
        setPreviousVisitorLocation("somewhere on Earth");
      } finally {
        setIsLoading(false);
      }
    }

    recordAndFetchVisitorInfo();
  }, []);

  if (
    isLoading ||
    !previousVisitorLocation ||
    previousVisitorLocation === "nowhere yet"
  ) {
    return null; // Don't show anything while loading or if there's no previous visitor
  }

  return (
    <div className="mt-4 text-xs text-neutral-400 opacity-50 transition-opacity hover:opacity-100">
      <p>Last visitor was from {previousVisitorLocation}</p>
    </div>
  );
}
