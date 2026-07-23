/**
 * sfx — curated interaction sounds synthesized via the Web Audio API.
 * Adapted from Cuelume (MIT, Daniel Belyi). See ./NOTICE.
 *
 * Declarative:
 *   import { bind } from "@/lib/sfx";
 *   bind(); // wires up all data-sfx-* attributes
 *
 * Imperative:
 *   import { play, playRecipe } from "@/lib/sfx";
 *   play("tick");
 */

export type {
  NoiseLayer,
  Shimmer,
  SoundLayer,
  SoundName,
  SoundRecipe,
  ToneLayer,
} from "./sounds/recipes";
export {
  RECIPES,
  SOUND_BLURBS,
  cloneRecipe,
  createBlankRecipe,
  isSoundName,
  sounds,
} from "./sounds/recipes";
export { isEnabled, play, playRecipe, setEnabled } from "./audio/engine";
export { bind } from "./interactions/bind";
