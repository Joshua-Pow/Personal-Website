import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense } from "react";

import { ClientOnly } from "@/components/ClientOnly";
import {
  fetchVisitorLocation,
  selectPreviousVisitor,
  visitorLocationQueryKey,
} from "@/lib/visitor-location";

const Globe = lazy(() => import("./Globe"));

const globeFallback = (
  <div
    className="mb-8 flex h-[300px] w-[300px] items-center justify-center"
    aria-hidden
  />
);

export default function VisitorGlobe() {
  const { data, isLoading } = useQuery({
    queryKey: visitorLocationQueryKey,
    queryFn: fetchVisitorLocation,
  });
  const visitorData = data ? selectPreviousVisitor(data) : undefined;

  return (
    <div className="mb-8 flex flex-col items-center justify-center">
      <div className="flex h-[300px] w-[300px] items-center justify-center">
        <ClientOnly fallback={globeFallback}>
          <Suspense fallback={globeFallback}>
            <Globe visitorData={visitorData} />
          </Suspense>
        </ClientOnly>
      </div>
      {!isLoading && visitorData ? (
        <p className="mt-2 text-center text-xs text-subtle">
          Last visitor was from {visitorData.location}
        </p>
      ) : null}
    </div>
  );
}
