"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Globe from "./Globe";
import { VisitorData } from "./LastVisitor";
import { durations } from "@/lib/motion";
import type { VisitorLocationResponse } from "@/app/api/visitor-location/route";

export default function VisitorGlobe() {
  const [visitorData, setVisitorData] = useState<VisitorData | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchVisitorInfo() {
      try {
        const recordResponse = await fetch("/api/visitor-location", {
          method: "POST",
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
      {!isLoading && visitorData && (
        <motion.p
          className="mt-2 text-center text-xs text-neutral-400 opacity-50 hover:opacity-100"
          whileTap={{ scale: 0.98 }}
          transition={{ duration: durations.fast }}
        >
          Last visitor was from {visitorData.location}
        </motion.p>
      )}
    </div>
  );
}
