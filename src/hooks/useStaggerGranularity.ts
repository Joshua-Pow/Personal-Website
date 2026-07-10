"use client";

import { useSyncExternalStore } from "react";

export type StaggerGranularity = "char" | "word";

const DESKTOP_FINE_POINTER_QUERY = "(min-width: 768px) and (pointer: fine)";

function subscribe(onStoreChange: () => void) {
  const media = window.matchMedia(DESKTOP_FINE_POINTER_QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getSnapshot(): StaggerGranularity {
  return window.matchMedia(DESKTOP_FINE_POINTER_QUERY).matches ? "char" : "word";
}

function getServerSnapshot(): StaggerGranularity {
  return "word";
}

export function useStaggerGranularity(): StaggerGranularity {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
