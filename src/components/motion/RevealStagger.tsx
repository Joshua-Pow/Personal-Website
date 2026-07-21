"use client";

import { Children } from "react";
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
 * Staggers children with the shared text-enter Motion recipe.
 */
export function RevealStagger({
  children,
  className,
  baseDelay = textRevealBaseDelay,
  stagger = textRevealStaggerMs,
}: RevealStaggerProps) {
  const reducedMotion = useReducedMotion();
  const ready = usePageEnterReady();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate={ready ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger / 1000,
            delayChildren: baseDelay / 1000,
          },
        },
      }}
    >
      {Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: fadeUp.initial,
            visible: {
              ...fadeUp.animate,
              transition: getTransition(durations.reveal),
            },
          }}
          style={{ willChange: "opacity, transform, filter" }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
