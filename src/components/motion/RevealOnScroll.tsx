import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";

import { usePageEnterReady } from "@/components/motion/PageEnterProvider";
import { getVariantTransition, variants } from "@/lib/motion";
import type { VariantName } from "@/lib/motion";

interface RevealOnScrollProps {
  children: React.ReactNode;
  variant?: VariantName;
  /** Delay in milliseconds. */
  delay?: number;
  className?: string;
  as?: "div" | "p" | "span" | "h2";
}

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
  const pageReady = usePageEnterReady();
  const Component = motion[as];
  const v = variants[variant];
  const transition = getVariantTransition(
    variant,
    delay,
    reducedMotion ?? false
  );
  // Wait for page-enter (post view-transition) so first-viewport cards don't
  // animate during the shared-element morph.
  const shouldReveal = Boolean(reducedMotion || (isInView && pageReady));
  const [promoting, setPromoting] = useState(false);

  return (
    <Component
      ref={ref}
      initial={reducedMotion ? false : v.initial}
      animate={shouldReveal ? v.animate : v.initial}
      transition={transition}
      className={className}
      onAnimationStart={() => {
        if (!reducedMotion && shouldReveal) {
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
