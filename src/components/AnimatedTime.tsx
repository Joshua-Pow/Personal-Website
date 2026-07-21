"use client";

import React, { useEffect, useSyncExternalStore, useState, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { play } from "@/lib/sfx";
import {
  getTickSoundMutedServerSnapshot,
  getTickSoundMutedSnapshot,
  subscribeAlignedSecondTick,
  subscribeTickSoundMuted,
} from "@/lib/tick-sound";

interface Props {
  graduationDate: Date;
}

type TimeElapsed = {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

/** Least-significant unit first so rollovers cascade like a flip board. */
const FLIP_UNITS = [
  "seconds",
  "minutes",
  "hours",
  "days",
  "months",
  "years",
] as const;

/** Springy reel: snappy start, soft settle. */
const digitSpring = {
  type: "spring" as const,
  stiffness: 380,
  damping: 26,
  mass: 0.7,
};

/** Total window for a multi-digit rollover cascade (ms). */
const ROLLOVER_MS = 320;

type DigitFlip = {
  key: string;
  unit: (typeof FLIP_UNITS)[number];
  index: number;
};

/**
 * Ease-in stagger: early flips bunch up, later ones spread out —
 * fast start, slow down into the final click.
 */
function cascadeDelayMs(index: number, count: number): number {
  if (count <= 1) return 0;
  const t = index / (count - 1);
  return ROLLOVER_MS * t * t;
}

/** Digits that changed, ordered ones→tens within each unit, seconds→years. */
function collectDigitFlips(prev: TimeElapsed, next: TimeElapsed): DigitFlip[] {
  const flips: DigitFlip[] = [];

  for (const unit of FLIP_UNITS) {
    const prevDigits = prev[unit].toString().padStart(2, "0");
    const nextDigits = next[unit].toString().padStart(2, "0");
    if (prevDigits === nextDigits) continue;

    for (let index = nextDigits.length - 1; index >= 0; index -= 1) {
      if (prevDigits[index] !== nextDigits[index]) {
        flips.push({ key: `${unit}-${index}`, unit, index });
      }
    }
  }

  return flips;
}

function DigitColumn({
  digit,
  reducedMotion,
  delay = 0,
}: {
  digit: number;
  reducedMotion: boolean;
  delay?: number;
}) {
  return (
    <span className="relative h-6 w-3 overflow-hidden sm:h-8 sm:w-4">
      {reducedMotion ? (
        <span className="flex h-6 w-3 items-center justify-center text-xs sm:h-8 sm:w-4 sm:text-base">
          {digit}
        </span>
      ) : (
        <motion.span
          className="absolute left-0 flex flex-col"
          animate={{ y: `-${digit * 10}%` }}
          transition={{ ...digitSpring, delay }}
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <span
              key={num}
              className="flex h-6 w-3 items-center justify-center text-xs sm:h-8 sm:w-4 sm:text-base"
            >
              {num}
            </span>
          ))}
        </motion.span>
      )}
    </span>
  );
}

function AnimatedTime({ graduationDate }: Props) {
  const [timeElapsed, setTimeElapsed] = useState<TimeElapsed>({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [flipDelays, setFlipDelays] = useState<Record<string, number>>({});

  const prevTimeRef = useRef(timeElapsed);
  const hasTickedRef = useRef(false);
  const isVisibleRef = useRef(true);
  const soundTimeoutsRef = useRef<number[]>([]);
  const isMuted = useSyncExternalStore(
    subscribeTickSoundMuted,
    getTickSoundMutedSnapshot,
    getTickSoundMutedServerSnapshot
  );
  const isMutedRef = useRef(isMuted);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const clearSoundTimeouts = () => {
      soundTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
      soundTimeoutsRef.current = [];
    };

    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const tick = () => {
      if (document.hidden) return;

      const now = new Date();
      const diff = now.getTime() - graduationDate.getTime();

      const newTimeElapsed: TimeElapsed = {
        years: Math.floor(diff / (1000 * 60 * 60 * 24 * 365)),
        months: Math.floor(
          (diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30)
        ),
        days: Math.floor(
          (diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24)
        ),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };

      const flips = collectDigitFlips(prevTimeRef.current, newTimeElapsed);
      clearSoundTimeouts();

      if (
        hasTickedRef.current &&
        flips.length > 0 &&
        isVisibleRef.current &&
        !reducedMotion
      ) {
        const delays: Record<string, number> = {};
        flips.forEach((flip, index) => {
          const delayMs = cascadeDelayMs(index, flips.length);
          delays[flip.key] = delayMs / 1000;

          if (!isMutedRef.current) {
            const timeoutId = window.setTimeout(() => {
              play("toggle");
            }, delayMs);
            soundTimeoutsRef.current.push(timeoutId);
          }
        });
        setFlipDelays(delays);
      } else {
        setFlipDelays({});
      }

      hasTickedRef.current = true;
      prevTimeRef.current = newTimeElapsed;
      setTimeElapsed(newTimeElapsed);
    };

    tick();
    const stopAlignedTicks = subscribeAlignedSecondTick(tick);

    return () => {
      stopAlignedTicks();
      clearSoundTimeouts();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [graduationDate, reducedMotion]);

  return (
    <span
      suppressHydrationWarning
      aria-live="polite"
      aria-atomic="true"
      className="inline-flex gap-0.5 font-mono tabular-nums sm:gap-1"
    >
      {Object.entries(timeElapsed).map(([unit, value]) =>
        unit === "years" && value === 0 ? null : (
          <span key={unit} className="flex flex-col items-center">
            <span className="relative flex items-center justify-center rounded-md bg-elevated px-1 shadow-sm">
              <span className="flex h-full items-center">
                {value
                  .toString()
                  .padStart(2, "0")
                  .split("")
                  .map((digit, idx) => {
                    const key = `${unit}-${idx}`;
                    return (
                      <DigitColumn
                        key={key}
                        digit={parseInt(digit, 10)}
                        reducedMotion={reducedMotion ?? false}
                        delay={flipDelays[key] ?? 0}
                      />
                    );
                  })}
              </span>
            </span>
            <span className="mt-1 text-[8px] sm:text-xs">{unit}</span>
          </span>
        )
      )}
    </span>
  );
}

export default AnimatedTime;
