"use client";

import { Children, isValidElement } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  getVariantTransition,
  variants,
  type VariantName,
} from "@/lib/motion";

type RevealStaggerProps = {
  children: React.ReactNode;
  className?: string;
  /** Delay between each child reveal, in seconds. */
  stagger?: number;
  variant?: VariantName;
};

export function RevealStagger({
  children,
  className,
  stagger = 0.08,
  variant = "blurUp",
}: RevealStaggerProps) {
  const reducedMotion = useReducedMotion();
  const v = variants[variant];
  const itemTransition = getVariantTransition(
    variant,
    0,
    reducedMotion ?? false
  );

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reducedMotion ? 0 : stagger,
          },
        },
      }}
    >
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;

        return (
          <motion.div
            key={child.key ?? index}
            variants={{
              hidden: v.initial,
              visible: {
                ...v.animate,
                transition: itemTransition,
              },
            }}
          >
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
