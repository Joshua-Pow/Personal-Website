"use client";

import { Children, isValidElement } from "react";
import { motion, useReducedMotion } from "motion/react";
import { durations, fadeUp, getTransition } from "@/lib/motion";

type RevealStaggerProps = {
  children: React.ReactNode;
  className?: string;
};

export function RevealStagger({ children, className }: RevealStaggerProps) {
  const reducedMotion = useReducedMotion();
  const itemTransition = getTransition(durations.reveal, reducedMotion ?? false);

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reducedMotion ? 0 : 0.03,
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
              hidden: fadeUp.initial,
              visible: {
                ...fadeUp.animate,
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
