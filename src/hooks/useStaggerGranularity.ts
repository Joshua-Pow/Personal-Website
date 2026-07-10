"use client";

export type StaggerGranularity = "sentence" | "word" | "char";

export function useStaggerGranularity(): StaggerGranularity {
  return "sentence";
}
