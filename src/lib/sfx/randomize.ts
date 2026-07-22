import type {
  NoiseLayer,
  SoundLayer,
  SoundRecipe,
  ToneLayer,
} from "./sounds/recipes";

const WAVEFORMS: OscillatorType[] = ["sine", "triangle", "square", "sawtooth"];
const FILTER_TYPES: BiquadFilterType[] = [
  "lowpass",
  "highpass",
  "bandpass",
  "notch",
];

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function round(value: number, digits = 3): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function randomTone(): ToneLayer {
  const frequency = round(rand(220, 2400), 0);
  const attack = round(rand(0.002, 0.08));
  const decay = round(rand(0.06, 0.42));
  const glide = Math.random() > 0.62;
  return {
    kind: "tone",
    waveform: pick(WAVEFORMS),
    frequency,
    attack,
    decay,
    peak: round(rand(0.03, 0.14)),
    offset: Math.random() > 0.55 ? round(rand(0.02, 0.18)) : undefined,
    detune: Math.random() > 0.7 ? round(rand(-18, 18), 0) : undefined,
    glideTo: glide ? round(rand(180, 2800), 0) : undefined,
    glideTime: glide ? round(rand(0.04, 0.22)) : undefined,
  };
}

function randomNoise(): NoiseLayer {
  return {
    kind: "noise",
    filterType: pick(FILTER_TYPES),
    filterFrequency: round(rand(400, 5200), 0),
    filterQ: round(rand(0.4, 6), 1),
    attack: round(rand(0.004, 0.08)),
    decay: round(rand(0.08, 0.4)),
    peak: round(rand(0.02, 0.1)),
    offset: Math.random() > 0.6 ? round(rand(0.01, 0.12)) : undefined,
  };
}

function randomLayer(): SoundLayer {
  return Math.random() > 0.28 ? randomTone() : randomNoise();
}

/** Build a playful random recipe for the /sfx shuffle action. */
export function createRandomRecipe(): SoundRecipe {
  const layerCount = Math.random() > 0.45 ? 2 : Math.random() > 0.55 ? 1 : 3;
  const layers = Array.from({ length: layerCount }, () => randomLayer());
  const withShimmer = Math.random() > 0.4;

  return {
    masterGain: round(rand(0.32, 0.72), 2),
    layers,
    shimmer: withShimmer
      ? {
          delay: round(rand(0.05, 0.22)),
          feedback: round(rand(0.12, 0.4)),
          wet: round(rand(0.08, 0.28)),
          lowpass: round(rand(1800, 6500), 0),
        }
      : undefined,
  };
}
