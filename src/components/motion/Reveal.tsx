"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  getTransition,
  getVariantTransition,
  variants,
  type VariantName,
} from "@/lib/motion";

type RevealProps = {
  children: React.ReactNode;
  variant?: VariantName;
  delay?: number;
  duration?: number;
  className?: string;
  as?: "div" | "p" | "span" | "h1" | "h2" | "section";
  "data-vt"?: string;
};

export function Reveal({
  children,
  variant = "fadeUp",
  delay = 0,
  duration,
  className,
  as = "div",
  "data-vt": dataVt,
}: RevealProps) {
  const reducedMotion = useReducedMotion();
  const Component = motion[as];
  const v = variants[variant];
  const transition =
    duration !== undefined
      ? getTransition(duration, reducedMotion ?? false, delay)
      : getVariantTransition(variant, delay, reducedMotion ?? false);

  return (
    <Component
      initial={v.initial}
      animate={v.animate}
      transition={transition}
      className={className}
      data-vt={dataVt}
    >
      {children}
    </Component>
  );
}
