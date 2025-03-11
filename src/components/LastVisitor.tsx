"use client";

import { useEffect, useState } from "react";

export default function LastVisitor() {
  const [lastVisitorLocation, setLastVisitorLocation] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchVisitorInfo() {
      try {
        const response = await fetch("/api/visitor-location");
        if (!response.ok) throw new Error("Failed to fetch visitor location");

        const data = await response.json();
        setLastVisitorLocation(data.location);
      } catch (error) {
        console.error("Error fetching visitor location:", error);
        setLastVisitorLocation("somewhere on Earth");
      } finally {
        setIsLoading(false);
      }
    }

    fetchVisitorInfo();
  }, []);

  if (isLoading) {
    return null; // Don't show anything while loading
  }

  return (
    <div className="mt-4 text-xs text-neutral-400 opacity-50 transition-opacity hover:opacity-100">
      <p>Last visitor was from {lastVisitorLocation}</p>
    </div>
  );
}
