import type { TargetAndTransition, Transition } from "motion/react";

export const easeOut = [0.23, 1, 0.32, 1] as const;
export const easeIn = [0.4, 0, 1, 1] as const;
export const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export const durations = {
  fast: 0.15,
  ui: 0.2,
  reveal: 0.25,
  page: 0.35,
  nameLetter: 0.28,
  nameFade: 0.35,
  pageTitle: 0.45,
  sharedElement: 0.75,
  previewMorph: 0.28,
} as const;

export const nameLetterStagger = 0.035;

export const revealStaggerBy = 0.1;
export const revealStaggerStartDelay = 0.2;
export const charStaggerBy = 0.018;
export const charStaggerStartDelay = 0.3;
export const sentenceStaggerBy = 0.2;
export const sentenceStaggerStartDelay = 0.5;
export const revealStaggerDuration = 0.65;

export const textRevealBlur = 4;

export const popupHidden = {
  opacity: 0,
  y: 4,
  filter: "blur(2px)",
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

export const fadeUp: MotionVariant = {
  initial: { opacity: 0, y: "20%" },
  animate: { opacity: 1, y: 0 },
};

export const fadeScaleUp: MotionVariant = {
  initial: { opacity: 0, y: "20%", scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
};

export const textReveal: MotionVariant = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
};

export const textRevealSentence: MotionVariant = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

export const textRevealSoft: MotionVariant = {
  initial: {
    opacity: 0,
    y: 8,
    filter: `blur(${textRevealBlur}px)`,
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
  },
};

export const fadeUpSm: MotionVariant = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

export const fadeIn: MotionVariant = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

export const blurIn: MotionVariant = {
  initial: { opacity: 0, filter: "blur(8px)" },
  animate: { opacity: 1, filter: "blur(0px)" },
};

export const blurUp: MotionVariant = {
  initial: { opacity: 0, y: 12, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export const blurUpLg: MotionVariant = {
  initial: { opacity: 0, y: 16, filter: "blur(12px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export const focusIn: MotionVariant = {
  initial: { opacity: 0, scale: 0.96, filter: "blur(4px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
};

export const variants = {
  fadeUp,
  fadeScaleUp,
  textReveal,
  textRevealSentence,
  textRevealSoft,
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
  fadeScaleUp: revealStaggerDuration,
  textReveal: durations.page,
  textRevealSentence: durations.pageTitle,
  textRevealSoft: revealStaggerDuration,
  fadeUpSm: durations.ui,
  fadeIn: durations.ui,
  blurIn: durations.pageTitle,
  blurUp: durations.reveal,
  blurUpLg: durations.reveal,
  focusIn: durations.page,
};

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
    duration,
    ease: easeIn,
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

export function getTextRevealTransition(
  reduced?: boolean,
  delay = 0,
  granularity: "char" | "sentence" = "char"
): Transition {
  if (reduced) {
    return { duration: 0, delay: 0 };
  }

  if (granularity === "sentence") {
    return {
      delay,
      opacity: { duration: 0.8, ease: easeOutExpo },
      y: { duration: 0.85, ease: easeOutExpo },
    };
  }

  return {
    delay,
    opacity: { duration: 0.5, ease: easeOutExpo },
    y: { duration: 0.55, ease: easeOutExpo },
  };
}

export function getTextRevealSoftTransition(
  reduced?: boolean,
  delay = 0
): Transition {
  if (reduced) {
    return { duration: 0, delay: 0 };
  }

  return {
    delay,
    opacity: { duration: 0.6, ease: easeOutExpo },
    y: { duration: 0.65, ease: easeOutExpo },
    filter: { duration: 0.7, ease: easeOutExpo },
  };
}
