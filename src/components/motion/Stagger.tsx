"use client";

import { createContext, useContext, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useStaggerGranularity, type StaggerGranularity } from "@/hooks/useStaggerGranularity";
import {
  charStaggerBy,
  charStaggerStartDelay,
  getTextRevealSoftTransition,
  getTextRevealTransition,
  getVariantTransition,
  revealStaggerBy,
  revealStaggerStartDelay,
  variants,
  wordStaggerBy,
  wordStaggerStartDelay,
  type VariantName,
} from "@/lib/motion";

type StaggerContextValue = {
  variant: VariantName;
  reducedMotion: boolean;
  staggerBy: number;
  startDelay: number;
  granularity: StaggerGranularity;
  getIndex: () => number;
};

const StaggerContext = createContext<StaggerContextValue | null>(null);

function useStaggerContext() {
  const context = useContext(StaggerContext);
  if (!context) {
    throw new Error("Stagger components must be used within StaggerGroup");
  }
  return context;
}

export function useStaggerItem() {
  const { variant, reducedMotion, staggerBy, startDelay, getIndex, granularity } =
    useStaggerContext();
  const index = getIndex();
  const v =
    variant === "textReveal" && granularity === "word"
      ? variants.textRevealWord
      : variants[variant];
  const delay = reducedMotion ? 0 : startDelay + index * staggerBy;
  const transition =
    variant === "textReveal"
      ? getTextRevealTransition(reducedMotion, delay, granularity)
      : variant === "textRevealSoft"
        ? getTextRevealSoftTransition(reducedMotion, delay)
        : { ...getVariantTransition(variant, 0, reducedMotion), delay };

  return { v, transition, reducedMotion };
}

export function useStaggerGranularityContext(): StaggerGranularity {
  return useStaggerContext().granularity;
}

type StaggerGroupProps = {
  children: ReactNode;
  className?: string;
  variant?: VariantName;
  staggerBy?: number;
  startDelay?: number;
  adaptive?: boolean;
};

export function StaggerGroup({
  children,
  className,
  variant = "fadeUp",
  staggerBy,
  startDelay,
  adaptive = false,
}: StaggerGroupProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const granularity = useStaggerGranularity();
  const isCharMode = granularity === "char";

  const resolvedVariant = adaptive ? "textReveal" : variant;
  const resolvedStaggerBy =
    staggerBy ??
    (adaptive ? (isCharMode ? charStaggerBy : wordStaggerBy) : revealStaggerBy);
  const resolvedStartDelay =
    startDelay ??
    (adaptive
      ? isCharMode
        ? charStaggerStartDelay
        : wordStaggerStartDelay
      : revealStaggerStartDelay);

  let index = 0;
  const getIndex = () => index++;

  return (
    <StaggerContext.Provider
      value={{
        variant: resolvedVariant,
        reducedMotion,
        staggerBy: resolvedStaggerBy,
        startDelay: resolvedStartDelay,
        granularity,
        getIndex,
      }}
    >
      <div className={className}>{children}</div>
    </StaggerContext.Provider>
  );
}

type StaggerBlockProps = {
  children: ReactNode;
  className?: string;
};

export function StaggerBlock({ children, className }: StaggerBlockProps) {
  const { v, transition, reducedMotion } = useStaggerItem();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={v.initial}
      animate={v.animate}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
