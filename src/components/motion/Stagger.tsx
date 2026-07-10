"use client";

import { createContext, useContext, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import {
  useStaggerGranularity,
  type StaggerGranularity,
} from "@/hooks/useStaggerGranularity";
import {
  charRevealDuration,
  charStaggerBy,
  charStaggerStartDelay,
  revealStaggerBy,
  revealStaggerDuration,
  revealStaggerStartDelay,
  sentenceRevealDuration,
  sentenceStaggerBy,
  sentenceStaggerStartDelay,
  timeUnitStaggerBy,
  wordRevealDuration,
  wordStaggerBy,
  wordStaggerStartDelay,
} from "@/lib/motion";
import { cn } from "@/lib/utils/cn";

type StaggerContextValue = {
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
  const { reducedMotion, staggerBy, startDelay, getIndex, granularity } =
    useStaggerContext();
  const [index] = useState(() => getIndex());

  const delay = reducedMotion ? 0 : startDelay + index * staggerBy;
  const duration =
    granularity === "sentence"
      ? sentenceRevealDuration
      : granularity === "word"
        ? wordRevealDuration
        : charRevealDuration;

  return { delay, duration, reducedMotion, granularity };
}

export function useStaggerGranularityContext(): StaggerGranularity {
  return useStaggerContext().granularity;
}

export function useStaggerEntrance() {
  const { delay, duration, reducedMotion } = useStaggerItem();

  return {
    delay,
    duration,
    reducedMotion,
    unitStaggerBy: timeUnitStaggerBy,
  };
}

type StaggerGroupProps = {
  children: ReactNode;
  className?: string;
  staggerBy?: number;
  startDelay?: number;
  adaptive?: boolean;
};

export function StaggerGroup({
  children,
  className,
  staggerBy,
  startDelay,
  adaptive = false,
}: StaggerGroupProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const granularity = useStaggerGranularity();

  const resolvedStaggerBy =
    staggerBy ??
    (adaptive
      ? granularity === "sentence"
        ? sentenceStaggerBy
        : granularity === "word"
          ? wordStaggerBy
          : charStaggerBy
      : revealStaggerBy);
  const resolvedStartDelay =
    startDelay ??
    (adaptive
      ? granularity === "sentence"
        ? sentenceStaggerStartDelay
        : granularity === "word"
          ? wordStaggerStartDelay
          : charStaggerStartDelay
      : revealStaggerStartDelay);

  let index = 0;
  const getIndex = () => index++;

  return (
    <StaggerContext.Provider
      value={{
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
  const { delay, reducedMotion } = useStaggerItem();

  const style = {
    "--stagger-delay": `${delay}s`,
    "--stagger-duration": `${revealStaggerDuration}s`,
  } as CSSProperties;

  return (
    <div className={className} style={style}>
      <div
        className={cn(
          "h-full w-full",
          reducedMotion ? "stagger-reveal-reduced" : "stagger-reveal-soft"
        )}
      >
        {children}
      </div>
    </div>
  );
}
