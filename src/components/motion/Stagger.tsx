"use client";

import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import {
  useStaggerGranularity,
  type StaggerGranularity,
} from "@/hooks/useStaggerGranularity";
import {
  charStaggerBy,
  charStaggerStartDelay,
  revealStaggerBy,
  revealStaggerStartDelay,
  sentenceStaggerBy,
  sentenceStaggerStartDelay,
} from "@/lib/motion";

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
  const index = getIndex();
  const delay = reducedMotion ? 0 : startDelay + index * staggerBy;
  const duration = granularity === "sentence" ? 0.8 : 0.55;

  return { delay, duration, reducedMotion, granularity };
}

export function useStaggerGranularityContext(): StaggerGranularity {
  return useStaggerContext().granularity;
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
  const isCharMode = granularity === "char";

  const resolvedStaggerBy =
    staggerBy ??
    (adaptive
      ? isCharMode
        ? charStaggerBy
        : sentenceStaggerBy
      : revealStaggerBy);
  const resolvedStartDelay =
    startDelay ??
    (adaptive
      ? isCharMode
        ? charStaggerStartDelay
        : sentenceStaggerStartDelay
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
  const { delay, duration, reducedMotion } = useStaggerItem();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const style = {
    "--stagger-delay": `${delay}s`,
    "--stagger-duration": `${duration}s`,
  } as CSSProperties;

  return (
    <div className={className} style={style}>
      <div className="stagger-reveal-soft h-full w-full">{children}</div>
    </div>
  );
}
