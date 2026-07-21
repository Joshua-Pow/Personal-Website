"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  getTransition,
  getVariantTransition,
  variants,
  type VariantName,
} from "@/lib/motion";
import { usePageEnterReady } from "@/components/motion/PageEnterProvider";

type RevealAs = "div" | "p" | "span" | "h1" | "h2" | "section";

type RevealProps = {
  children: React.ReactNode;
  variant?: VariantName;
  /** Delay in milliseconds. */
  delay?: number;
  duration?: number;
  className?: string;
  as?: RevealAs;
  "data-vt"?: string;
  /** Skip the shared page-enter gate (nested stagger children). */
  skipGate?: boolean;
};

export function Reveal({
  children,
  variant = "fadeUp",
  delay = 0,
  duration,
  className,
  as = "div",
  skipGate = false,
  "data-vt": dataVt,
}: RevealProps) {
  const reducedMotion = useReducedMotion();
  const pageReady = usePageEnterReady();
  const ready = skipGate || pageReady;
  const Component = motion[as];
  const v = variants[variant];
  const transition =
    duration !== undefined
      ? getTransition(duration, reducedMotion ?? false, delay)
      : getVariantTransition(variant, delay, reducedMotion ?? false);

  return (
    <Component
      initial={reducedMotion ? false : v.initial}
      animate={reducedMotion || ready ? v.animate : v.initial}
      transition={transition}
      className={className}
      data-vt={dataVt}
      style={{
        willChange:
          variant === "blurUp" || variant === "blurUpLg" || variant === "focusIn"
            ? "opacity, transform"
            : "opacity, transform, filter",
      }}
    >
      {children}
    </Component>
  );
}
