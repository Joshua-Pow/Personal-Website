import type { TargetAndTransition, Transition } from "motion/react";

/**
 * Enter ease from Danny Williams' about-page recipe:
 * cubic-bezier(0.165, 0.84, 0.44, 1)
 */
export const easeOut = [0.165, 0.84, 0.44, 1] as const;
export const easeIn = [0.4, 0, 1, 1] as const;

/** Durations in seconds. */
export const durations = {
  fast: 0.15,
  ui: 0.2,
  /** Page text enter (Danny Williams about-page: 700ms). */
  reveal: 0.7,
  page: 0.7,
  nameLetter: 0.28,
  nameFade: 0.35,
  pageTitle: 0.7,
  sharedElement: 0.5,
  previewMorph: 0.28,
} as const;

/** Stagger between enter items (ms). About-page body uses ~100ms. */
export const textRevealStaggerMs = 100;

/** Delay before the first home intro line (ms). */
export const textRevealBaseDelay = 200;

/** Choreography delays in milliseconds. */
export const enterDelays = {
  title: 80,
  intro: 180,
  content: 280,
  secondary: 900,
  tertiary: 1050,
} as const;

export const nameLetterStagger = 0.04;

const ENTER_BLUR = "blur(6px)" as const;

export const popupHidden = {
  opacity: 0,
  y: 4,
  filter: ENTER_BLUR,
} as const;

export const popupVisible = {
  opacity: 1,
  y: 0,
  filter: "blur(0px)",
} as const;

type MotionVariant = {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
};

/** Canonical text enter — blur 6px + y 8px over 700ms. */
export const fadeUp: MotionVariant = {
  initial: { opacity: 0, y: 8, filter: ENTER_BLUR },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export const fadeUpSm: MotionVariant = fadeUp;

export const fadeIn: MotionVariant = {
  initial: { opacity: 0, filter: ENTER_BLUR },
  animate: { opacity: 1, filter: "blur(0px)" },
};

export const blurIn: MotionVariant = fadeUp;

/** Cards / sections — rise only (no blur on large surfaces). */
export const blurUp: MotionVariant = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

export const blurUpLg: MotionVariant = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

/** Widgets (Spotify, globe) — slight scale, no blur. */
export const focusIn: MotionVariant = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
};

export const variants = {
  fadeUp,
  fadeUpSm,
  fadeIn,
  blurIn,
  blurUp,
  blurUpLg,
  focusIn,
} as const;

export type VariantName = keyof typeof variants;

const variantDurations: Record<VariantName, number> = {
  fadeUp: durations.reveal,
  fadeUpSm: durations.reveal,
  fadeIn: durations.ui,
  blurIn: durations.pageTitle,
  blurUp: durations.reveal,
  blurUpLg: durations.reveal,
  focusIn: durations.page,
};

/** `delay` is milliseconds. */
export function getTransition(
  duration: number,
  reduced?: boolean,
  delay = 0
): Transition {
  if (reduced) {
    return { duration: 0, delay: 0 };
  }
  return {
    duration,
    ease: easeOut,
    delay: delay / 1000,
  };
}

export function getExitTransition(
  duration: number,
  reduced?: boolean,
  delay = 0
): Transition {
  if (reduced) {
    return { duration: 0, delay: 0 };
  }
  return {
    duration: duration * 0.75,
    ease: easeOut,
    delay: delay / 1000,
  };
}

export function getVariantTransition(
  variant: VariantName,
  delay = 0,
  reduced?: boolean
): Transition {
  return getTransition(variantDurations[variant], reduced, delay);
}
