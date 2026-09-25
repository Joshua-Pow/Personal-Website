import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

import { usePageEnterReady } from "@/components/motion/PageEnterProvider";
import { getTransition, getVariantTransition, variants } from "@/lib/motion";
import type { VariantName } from "@/lib/motion";

type RevealAs = "div" | "p" | "span" | "h1" | "h2" | "section";

interface RevealProps {
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
}

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
    duration === undefined
      ? getVariantTransition(variant, delay, reducedMotion ?? false)
      : getTransition(duration, reducedMotion ?? false, delay);
  const [promoting, setPromoting] = useState(false);

  return (
    <Component
      initial={reducedMotion ? false : v.initial}
      animate={reducedMotion || ready ? v.animate : v.initial}
      transition={transition}
      className={className}
      data-vt={dataVt}
      onAnimationStart={() => {
        if (!reducedMotion && ready) {
          setPromoting(true);
        }
      }}
      onAnimationComplete={() => setPromoting(false)}
      style={{
        willChange: promoting ? "opacity, transform" : "auto",
      }}
    >
      {children}
    </Component>
  );
}
