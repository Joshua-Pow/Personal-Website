"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { VisitorData } from "./LastVisitor";
import { getOrCreateVisitorId } from "@/lib/visitor-id";
import type { VisitorLocationResponse } from "@/app/api/visitor-location/route";

const Globe = dynamic(() => import("./Globe"), { ssr: false });

export default function VisitorGlobe() {
  const [visitorData, setVisitorData] = useState<VisitorData | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchVisitorInfo() {
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
          setVisitorData({
            location: data.previousLocation,
            latitude: data.previousLatitude,
            longitude: data.previousLongitude,
          });
        } else {
          setVisitorData(undefined);
        }
      } catch (error) {
        console.error("Error fetching visitor location:", error);
        setVisitorData(undefined);
      } finally {
        setIsLoading(false);
      }
    }

    fetchVisitorInfo();
  }, []);

  return (
    <div className="mb-8 flex flex-col items-center justify-center">
      <div className="flex h-[300px] w-[300px] items-center justify-center">
        <Globe visitorData={visitorData} />
      </div>
      {!isLoading && visitorData ? (
        <p className="mt-2 text-center text-xs text-subtle">
          Last visitor was from {visitorData.location}
        </p>
      ) : null}
    </div>
  );
}
