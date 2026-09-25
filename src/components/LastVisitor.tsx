import { useQuery } from "@tanstack/react-query";

import {
  fetchVisitorLocation,
  selectPreviousVisitor,
  visitorLocationQueryKey,
} from "@/lib/visitor-location";

export type { VisitorData } from "@/lib/visitor-location";

export default function LastVisitor() {
  const { data, isLoading } = useQuery({
    queryKey: visitorLocationQueryKey,
    queryFn: fetchVisitorLocation,
  });
  const previousVisitorData = data ? selectPreviousVisitor(data) : undefined;

  if (isLoading || !previousVisitorData) {
    return null;
  }

  return (
    <div className="mt-4 text-xs text-subtle transition-opacity hover:text-accent motion-reduce:transition-none">
      <p>Last visitor was from {previousVisitorData.location}</p>
    </div>
  );
}
