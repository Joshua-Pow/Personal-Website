import type { SoundRecipe } from "./sounds/recipes";

export const SFX_DRAFTS_KEY = "sfx-recipe-drafts";

export type SfxDraft = {
  name: string;
  recipe: SoundRecipe;
  updatedAt: number;
};

export type SfxDraftMap = Record<string, SfxDraft>;

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedDrafts: SfxDraftMap = {};

function parseDrafts(raw: string | null): SfxDraftMap {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as SfxDraftMap;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function readDrafts(): SfxDraftMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SFX_DRAFTS_KEY);
    if (raw === cachedRaw) return cachedDrafts;
    cachedRaw = raw;
    cachedDrafts = parseDrafts(raw);
    return cachedDrafts;
  } catch {
    return {};
  }
}

export function writeDrafts(drafts: SfxDraftMap): void {
  if (typeof window === "undefined") return;
  try {
    const raw = JSON.stringify(drafts);
    localStorage.setItem(SFX_DRAFTS_KEY, raw);
    cachedRaw = raw;
    cachedDrafts = drafts;
    notify();
  } catch {
    // Ignore storage access errors
  }
}

export function subscribeDrafts(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  if (typeof window !== "undefined") {
    const onStorage = (event: StorageEvent) => {
      if (event.key === SFX_DRAFTS_KEY || event.key === null) {
        cachedRaw = null;
        onStoreChange();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(onStoreChange);
      window.removeEventListener("storage", onStorage);
    };
  }
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getDraftsSnapshot(): SfxDraftMap {
  return readDrafts();
}

export function getDraftsServerSnapshot(): SfxDraftMap {
  return {};
}

function formatValue(value: unknown, indent: number): string {
  const pad = "  ".repeat(indent);
  const next = "  ".repeat(indent + 1);

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const items = value
      .map((item) => `${next}${formatValue(item, indent + 1)}`)
      .join(",\n");
    return `[\n${items},\n${pad}]`;
  }

  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    const lines = entries
      .map(([key, val]) => `${next}${key}: ${formatValue(val, indent + 1)}`)
      .join(",\n");
    return `{\n${lines},\n${pad}}`;
  }

  if (typeof value === "string") return JSON.stringify(value);
  return String(value);
}

/** Generates a `RECIPES` entry snippet to paste into recipes.ts. */
export function recipeToTypeScript(name: string, recipe: SoundRecipe): string {
  return `  ${JSON.stringify(name)}: ${formatValue(recipe, 1)},`;
}
