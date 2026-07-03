"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  getVariantTransition,
  variants,
  type VariantName,
} from "@/lib/motion";

type RevealOnScrollProps = {
  children: React.ReactNode;
  variant?: VariantName;
  delay?: number;
  className?: string;
  as?: "div" | "p" | "span" | "h2";
};

export function RevealOnScroll({
  children,
  variant = "fadeUpSm",
  delay = 0,
  className,
  as = "div",
}: RevealOnScrollProps) {
  const reducedMotion = useReducedMotion();
  const Component = motion[as];
  const v = variants[variant];

  return (
    <Component
      initial={v.initial}
      whileInView={v.animate}
      viewport={{ once: true }}
      transition={getVariantTransition(variant, delay, reducedMotion ?? false)}
      className={className}
    >
      {children}
    </Component>
  );
}
