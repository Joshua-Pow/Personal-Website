import { motion, useReducedMotion } from "motion/react";
import { isValidElement, useState } from "react";
import type { ReactElement, ReactNode } from "react";

import { usePageEnterReady } from "@/components/motion/PageEnterProvider";
import {
  durations,
  fadeUp,
  getTransition,
  textRevealBaseDelay,
  textRevealStaggerMs,
} from "@/lib/motion";

interface RevealStaggerProps {
  children: ReactNode;
  className?: string;
  /** Delay before the first item (ms). */
  baseDelay?: number;
  /** Gap between items (ms). */
  stagger?: number;
}

function elementChildren(node: ReactNode): ReactElement[] {
  if (Array.isArray(node)) {
    return node.flatMap((child) => elementChildren(child));
  }
  if (isValidElement(node)) {
    return [node];
  }
  return [];
}

function StaggerItem({
  child,
  delay,
  ready,
}: {
  child: ReactElement;
  delay: number;
  ready: boolean;
}) {
  const [promoting, setPromoting] = useState(false);
  const transition = getTransition(durations.reveal, false, delay);

  return (
    <motion.div
      initial={fadeUp.initial}
      animate={ready ? fadeUp.animate : fadeUp.initial}
      transition={transition}
      onAnimationStart={() => {
        if (ready) {
          setPromoting(true);
        }
      }}
      onAnimationComplete={() => setPromoting(false)}
      style={{ willChange: promoting ? "opacity, transform" : "auto" }}
    >
      {child}
    </motion.div>
  );
}

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
  const items = elementChildren(children);

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={className}>
      {items.map((child, index) => {
        const delay = baseDelay + index * stagger;
        return (
          <StaggerItem
            key={child.key ?? index}
            child={child}
            delay={delay}
            ready={ready}
          />
        );
      })}
    </div>
  );
}
