"use client";

import { forwardRef } from "react";
import { motion, useIsPresent, type HTMLMotionProps } from "motion/react";
import {
  durations,
  getExitTransition,
  getTransition,
  popupHidden,
  popupVisible,
} from "@/lib/motion";

type PopoverSurfaceProps = HTMLMotionProps<"div"> & {
  reducedMotion: boolean;
};

export const PopoverSurface = forwardRef<HTMLDivElement, PopoverSurfaceProps>(
  function PopoverSurface(
    { reducedMotion, className, children, style, ...props },
    ref
  ) {
    const isPresent = useIsPresent();
    const enterTransition = getTransition(durations.ui, reducedMotion);
    const exitTransition = getExitTransition(durations.ui, reducedMotion);

    return (
      <motion.div
        ref={ref}
        initial={popupHidden}
        animate={popupVisible}
        exit={{ ...popupHidden, transition: exitTransition }}
        transition={enterTransition}
        className={className}
        style={{
          ...style,
          pointerEvents: isPresent ? style?.pointerEvents : "none",
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
