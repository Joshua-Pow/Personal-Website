"use client";

import React, { useEffect, useSyncExternalStore, useState, useRef, type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { easeOut } from "@/lib/motion";
import { cn } from "@/lib/utils/cn";
import {
  getTickSoundMutedServerSnapshot,
  getTickSoundMutedSnapshot,
  subscribeAlignedSecondTick,
  subscribeTickSoundMuted,
} from "@/lib/tick-sound";

type TimeEntrance = {
  delay: number;
  duration: number;
  reducedMotion: boolean;
  unitStaggerBy: number;
};

interface Props {
  graduationDate: Date;
  entrance?: TimeEntrance;
}

function playTickSequence(
  audioRef: React.RefObject<HTMLAudioElement | null>,
  count: number
) {
  let tickCount = 0;
  const interval = setInterval(() => {
    if (tickCount >= count) {
      clearInterval(interval);
      return;
    }
    audioRef.current?.play().catch(() => {});
    tickCount++;
  }, 50);
}

function DigitColumn({
  digit,
  reducedMotion,
}: {
  digit: number;
  reducedMotion: boolean;
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
          transition={{ duration: 0.28, ease: easeOut }}
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

function AnimatedTime({ graduationDate, entrance }: Props) {
  const [timeElapsed, setTimeElapsed] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevTimeRef = useRef(timeElapsed);
  const isVisibleRef = useRef(true);
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
    audioRef.current = new Audio("./click.wav");
    audioRef.current.volume = 0.05;

    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const tick = () => {
      if (document.hidden) return;

      const now = new Date();
      const diff = now.getTime() - graduationDate.getTime();

      const newTimeElapsed = {
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

      if (isVisibleRef.current && !reducedMotion && !isMutedRef.current) {
        Object.entries(newTimeElapsed).forEach(([unit, value]) => {
          const prevValue =
            prevTimeRef.current[unit as keyof typeof timeElapsed];
          if (value !== prevValue) {
            const difference = Math.abs(value - prevValue);
            playTickSequence(audioRef, Math.min(difference + 2, 8));
          }
        });
      }

      prevTimeRef.current = newTimeElapsed;
      setTimeElapsed(newTimeElapsed);
    };

    tick();
    const stopAlignedTicks = subscribeAlignedSecondTick(tick);

    return () => {
      stopAlignedTicks();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      audioRef.current?.remove();
    };
  }, [graduationDate, reducedMotion]);

  const renderUnit = (
    unit: string,
    content: ReactNode,
    unitIndex: number
  ) => {
    if (entrance) {
      const unitDelay = entrance.delay + unitIndex * entrance.unitStaggerBy;

      return (
        <span
          key={unit}
          className={cn(
            "inline-flex flex-col items-center",
            entrance.reducedMotion
              ? "stagger-reveal-reduced"
              : "stagger-reveal-soft"
          )}
          style={
            {
              "--stagger-delay": `${unitDelay}s`,
              "--stagger-duration": `${entrance.duration}s`,
            } as CSSProperties
          }
        >
          {content}
        </span>
      );
    }

    return (
      <span key={unit} className="flex flex-col items-center">
        {content}
      </span>
    );
  };

  let unitIndex = 0;

  return (
    <span
      suppressHydrationWarning
      aria-live="polite"
      aria-atomic="true"
      className="inline-flex gap-0.5 font-mono tabular-nums sm:gap-1"
    >
      {Object.entries(timeElapsed).map(([unit, value]) => {
        if (unit === "years" && value === 0) {
          return null;
        }

        const currentUnitIndex = unitIndex;
        unitIndex += 1;

        return renderUnit(
          unit,
          <>
            <span className="relative flex items-center justify-center rounded-md bg-elevated px-1 shadow-sm">
              <span className="flex h-full items-center">
                {value
                  .toString()
                  .padStart(2, "0")
                  .split("")
                  .map((digit, idx) => (
                    <DigitColumn
                      key={`${unit}-${idx}`}
                      digit={parseInt(digit, 10)}
                      reducedMotion={reducedMotion ?? false}
                    />
                  ))}
              </span>
            </span>
            <span className="mt-1 text-[8px] sm:text-xs">{unit}</span>
          </>,
          currentUnitIndex
        );
      })}
    </span>
  );
}

export default AnimatedTime;
