"use client";

import {
  Children,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { motion, stagger, useReducedMotion } from "motion/react";
import {
  getVariantTransition,
  revealStaggerBy,
  revealStaggerStartDelay,
  variants,
  type VariantName,
} from "@/lib/motion";

type RevealStaggerProps = {
  children: ReactNode;
  className?: string;
  variant?: VariantName;
  staggerBy?: number;
  startDelay?: number;
};

function flattenChildren(children: ReactNode): ReactElement[] {
  const items: ReactElement[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    if (child.type === Fragment) {
      items.push(
        ...flattenChildren((child.props as { children?: ReactNode }).children)
      );
      return;
    }

    items.push(child);
  });

  return items;
}

export function RevealStagger({
  children,
  className,
  variant = "fadeUp",
  staggerBy = revealStaggerBy,
  startDelay = revealStaggerStartDelay,
}: RevealStaggerProps) {
  const reducedMotion = useReducedMotion();
  const v = variants[variant];
  const itemTransition = getVariantTransition(variant, 0, reducedMotion ?? false);
  const items = flattenChildren(children);

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: reducedMotion
              ? 0
              : stagger(staggerBy, { startDelay }),
          },
        },
      }}
    >
      {items.map((child, index) => (
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
      ))}
    </motion.div>
  );
}
