"use client";

export type StaggerGranularity = "word" | "char";

export function useStaggerGranularity(): StaggerGranularity {
  return "word";
}
