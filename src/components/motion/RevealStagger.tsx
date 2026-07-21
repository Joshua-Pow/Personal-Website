"use client";

import { Children, isValidElement } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  durations,
  fadeUp,
  getTransition,
  textRevealBaseDelay,
  textRevealStaggerMs,
} from "@/lib/motion";
import { usePageEnterReady } from "@/components/motion/PageEnterProvider";

type RevealStaggerProps = {
  children: React.ReactNode;
  className?: string;
  /** Delay before the first item (ms). */
  baseDelay?: number;
  /** Gap between items (ms). */
  stagger?: number;
};

/**
 * Staggers each child with the shared text-enter Motion recipe.
 * Uses per-item delays (not staggerChildren) so delays aren't overridden.
 */
export function RevealStagger({
  children,
  className,
  baseDelay = textRevealBaseDelay,
  stagger = textRevealStaggerMs,
}: RevealStaggerProps) {
  const reducedMotion = useReducedMotion();
  const ready = usePageEnterReady();
  const items = Children.toArray(children).filter(isValidElement);

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={className}>
      {items.map((child, index) => {
        const delay = baseDelay + index * stagger;
        const transition = getTransition(durations.reveal, false, delay);

        return (
          <motion.div
            key={child.key ?? index}
            initial={fadeUp.initial}
            animate={ready ? fadeUp.animate : fadeUp.initial}
            transition={transition}
            style={{ willChange: "opacity, transform, filter" }}
          >
            {child}
          </motion.div>
        );
      })}
    </div>
  );
}
