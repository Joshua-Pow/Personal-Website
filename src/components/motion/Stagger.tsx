"use client";

import { createContext, useContext, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  getTextRevealTransition,
  getVariantTransition,
  revealStaggerBy,
  revealStaggerStartDelay,
  variants,
  type VariantName,
} from "@/lib/motion";
import { cn } from "@/lib/utils/cn";

type StaggerContextValue = {
  variant: VariantName;
  reducedMotion: boolean;
  staggerBy: number;
  startDelay: number;
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

function useStaggerItem() {
  const { variant, reducedMotion, staggerBy, startDelay, getIndex } =
    useStaggerContext();
  const index = getIndex();
  const v = variants[variant];
  const delay = reducedMotion ? 0 : startDelay + index * staggerBy;
  const transition =
    variant === "textReveal"
      ? getTextRevealTransition(reducedMotion, delay)
      : { ...getVariantTransition(variant, 0, reducedMotion), delay };

  return { v, transition, reducedMotion };
}

type StaggerGroupProps = {
  children: ReactNode;
  className?: string;
  variant?: VariantName;
  staggerBy?: number;
  startDelay?: number;
};

export function StaggerGroup({
  children,
  className,
  variant = "fadeUp",
  staggerBy = revealStaggerBy,
  startDelay = revealStaggerStartDelay,
}: StaggerGroupProps) {
  const reducedMotion = useReducedMotion() ?? false;
  let index = 0;
  const getIndex = () => index++;

  return (
    <StaggerContext.Provider
      value={{ variant, reducedMotion, staggerBy, startDelay, getIndex }}
    >
      <div className={className}>{children}</div>
    </StaggerContext.Provider>
  );
}

type StaggerSentenceProps = {
  children: ReactNode;
  className?: string;
};

export function StaggerSentence({ children, className }: StaggerSentenceProps) {
  const { v, transition, reducedMotion } = useStaggerItem();

  if (reducedMotion) {
    return <span className={cn("inline", className)}>{children}</span>;
  }

  return (
    <motion.span
      className={cn("inline", className)}
      style={{ transformOrigin: "left bottom" }}
      initial={v.initial}
      animate={v.animate}
      transition={transition}
    >
      {children}
    </motion.span>
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
