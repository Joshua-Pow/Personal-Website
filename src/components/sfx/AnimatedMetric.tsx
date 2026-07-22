"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { easeOut } from "@/lib/motion";
import { cn } from "@/lib/utils/cn";

type AnimatedMetricProps = {
  value: number;
  format: (value: number) => string;
  /** Reserve a fixed slot so digit-count changes never shove the layout. */
  widthCh: number;
  className?: string;
};

const DIGIT_SPRING = {
  type: "spring" as const,
  stiffness: 520,
  damping: 38,
  mass: 0.22,
};

const VALUE_SPRING = {
  stiffness: 480,
  damping: 42,
  mass: 0.2,
};

/**
 * Smooth slider readout (custom, no number library):
 *
 * Research patterns applied:
 * - Tabular nums + fixed `ch` width → no layout jump when digit count changes
 * - Spring-follow the live value → interruptible while dragging
 * - Per-digit odometer reels (translateY) for 0–9 → continuous, GPU-friendly
 * - Direction-aware crossfade only for non-digit glyphs (sign, unit, decimal)
 * - Reduced motion → instant swap, same fixed footprint
 */
export function AnimatedMetric({
  value,
  format,
  widthCh,
  className,
}: AnimatedMetricProps) {
  const reducedMotion = useReducedMotion();
  const spring = useSpring(value, VALUE_SPRING);
  const [sprung, setSprung] = useState(value);
  const [direction, setDirection] = useState(1);
  const prevDisplay = useRef(value);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useMotionValueEvent(spring, "change", (latest) => {
    const prev = prevDisplay.current;
    if (latest !== prev) {
      setDirection(latest > prev ? 1 : -1);
      prevDisplay.current = latest;
    }
    setSprung(latest);
  });

  const display = reducedMotion ? value : sprung;
  const text = format(display);
  // Right-align inside a fixed slot with figure spaces.
  const chars = text.padStart(widthCh, "\u2007").slice(-widthCh).split("");

  return (
    <span
      className={cn(
        "sfx-lab-slider-value inline-flex h-[1.15em] items-center justify-end tabular-nums",
        className
      )}
      style={{ width: `${widthCh}ch` }}
      aria-label={format(value)}
    >
      <span className="inline-flex items-center justify-end" aria-hidden>
        {chars.map((char, index) => (
          <MetricGlyph
            key={index}
            char={char}
            direction={direction}
            reducedMotion={!!reducedMotion}
          />
        ))}
      </span>
      <span className="sr-only">{format(value)}</span>
    </span>
  );
}

function MetricGlyph({
  char,
  direction,
  reducedMotion,
}: {
  char: string;
  direction: number;
  reducedMotion: boolean;
}) {
  if (char >= "0" && char <= "9") {
    const digit = Number(char);
    return (
      <span className="relative inline-block h-[1.15em] w-[1ch] overflow-hidden">
        <motion.span
          className="absolute left-0 top-0 flex flex-col will-change-transform"
          animate={{ y: `${-digit * 1.15}em` }}
          transition={reducedMotion ? { duration: 0 } : DIGIT_SPRING}
        >
          {Array.from({ length: 10 }, (_, n) => (
            <span
              key={n}
              className="flex h-[1.15em] w-[1ch] items-center justify-center"
            >
              {n}
            </span>
          ))}
        </motion.span>
      </span>
    );
  }

  // Sign / unit / decimal / figure-space: short direction-aware swap.
  return (
    <span className="relative inline-block h-[1.15em] w-[1ch] overflow-hidden">
      {reducedMotion ? (
        <span className="flex h-full w-full items-center justify-center">
          {char === "\u2007" ? "\u00a0" : char}
        </span>
      ) : (
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.span
            key={char}
            className="absolute inset-0 flex items-center justify-center"
            custom={direction}
            initial={{ y: `${0.45 * direction}em`, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{
              y: `${-0.45 * direction}em`,
              opacity: 0,
              transition: { duration: 0.1, ease: easeOut },
            }}
            transition={{ duration: 0.14, ease: easeOut }}
          >
            {char === "\u2007" ? "\u00a0" : char}
          </motion.span>
        </AnimatePresence>
      )}
    </span>
  );
}
