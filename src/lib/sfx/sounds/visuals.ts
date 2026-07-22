import type { SoundName } from "./recipes";

/**
 * Visual identity for each built-in — color, mark, and a plain-language cue
 * so the /sfx rail reads as a palette, not a glossary of synth jargon.
 */
export type SoundMarkId =
  | "chime"
  | "sparkle"
  | "droplet"
  | "bloom"
  | "whisper"
  | "tick"
  | "press"
  | "release"
  | "toggle"
  | "success"
  | "error"
  | "page"
  | "loading"
  | "ready"
  | "draft";

export type SoundVisual = {
  /** Display title (natural case). */
  title: string;
  /** One short cue — what it feels like / when to use it. */
  cue: string;
  /** OKLCH hue for badge wash + active tint. */
  hue: number;
  mark: SoundMarkId;
};

export const SOUND_VISUALS: Record<SoundName, SoundVisual> = {
  chime: {
    title: "Chime",
    cue: "Soft confirmation bell",
    hue: 88,
    mark: "chime",
  },
  sparkle: {
    title: "Sparkle",
    cue: "Playful four-note twinkle",
    hue: 312,
    mark: "sparkle",
  },
  droplet: {
    title: "Droplet",
    cue: "Note sliding downward",
    hue: 230,
    mark: "droplet",
  },
  bloom: {
    title: "Bloom",
    cue: "Warm slow swell",
    hue: 28,
    mark: "bloom",
  },
  whisper: {
    title: "Whisper",
    cue: "Breathy quiet hush",
    hue: 280,
    mark: "whisper",
  },
  tick: {
    title: "Tick",
    cue: "Crisp hover click",
    hue: 145,
    mark: "tick",
  },
  press: {
    title: "Press",
    cue: "Muted pointer-down knock",
    hue: 55,
    mark: "press",
  },
  release: {
    title: "Release",
    cue: "Springy pointer-up",
    hue: 78,
    mark: "release",
  },
  toggle: {
    title: "Toggle",
    cue: "Mechanical switch click",
    hue: 255,
    mark: "toggle",
  },
  success: {
    title: "Success",
    cue: "Warm three-note yes",
    hue: 145,
    mark: "success",
  },
  error: {
    title: "Error",
    cue: "Soft descending no",
    hue: 25,
    mark: "error",
  },
  page: {
    title: "Page",
    cue: "Papery flick",
    hue: 70,
    mark: "page",
  },
  loading: {
    title: "Loading",
    cue: "Work is starting",
    hue: 245,
    mark: "loading",
  },
  ready: {
    title: "Ready",
    cue: "Content settled in",
    hue: 95,
    mark: "ready",
  },
};

export const DRAFT_VISUAL: SoundVisual = {
  title: "Draft",
  cue: "Your custom recipe",
  hue: 60,
  mark: "draft",
};

export function getSoundVisual(
  name: string,
  kind: "builtin" | "draft"
): SoundVisual {
  if (kind === "draft") {
    return { ...DRAFT_VISUAL, title: name };
  }
  return (
    SOUND_VISUALS[name as SoundName] ?? {
      title: name,
      cue: "Custom sound",
      hue: 60,
      mark: "draft" as const,
    }
  );
}
