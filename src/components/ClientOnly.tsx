import { useSyncExternalStore } from "react";
import type { ReactNode } from "react";

function subscribeNever() {
  return () => null;
}

function clientSnapshot() {
  return true;
}

function serverSnapshot() {
  return false;
}

export function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const mounted = useSyncExternalStore(
    subscribeNever,
    clientSnapshot,
    serverSnapshot
  );

  if (!mounted) {
    return fallback;
  }

  return children;
}
