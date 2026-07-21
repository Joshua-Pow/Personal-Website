"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import {
  getVariantTransition,
  variants,
  type VariantName,
} from "@/lib/motion";

type RevealOnScrollProps = {
  children: React.ReactNode;
  variant?: VariantName;
  /** Delay in milliseconds. */
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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });
  const reducedMotion = useReducedMotion();
  const Component = motion[as];
  const v = variants[variant];
  const transition = getVariantTransition(
    variant,
    delay,
    reducedMotion ?? false
  );
  const shouldReveal = Boolean(reducedMotion || isInView);

  return (
    <Component
      ref={ref}
      initial={reducedMotion ? false : v.initial}
      animate={shouldReveal ? v.animate : v.initial}
      transition={transition}
      className={className}
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
