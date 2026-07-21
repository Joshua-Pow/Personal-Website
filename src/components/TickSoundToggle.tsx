"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils/cn";
import { easeOut } from "@/lib/motion";
import {
  getTickSoundMutedServerSnapshot,
  getTickSoundMutedSnapshot,
  subscribeTickSoundMuted,
  toggleTickSoundMuted,
} from "@/lib/tick-sound";

/** Lucide speaker body — shared by volume / volume-x. */
const SPEAKER_PATH =
  "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z";

/**
 * Mute toggle — Lucide-style speaker that morphs between sound waves
 * (unmuted) and an X slash (muted), inspired by animate-ui / lucide-animated.
 */
export function TickSoundToggle() {
  const reducedMotion = useReducedMotion();
  const muted = useSyncExternalStore(
    subscribeTickSoundMuted,
    getTickSoundMutedSnapshot,
    getTickSoundMutedServerSnapshot
  );

  const duration = reducedMotion ? 0 : 0.22;

  return (
    <button
      type="button"
      onClick={toggleTickSoundMuted}
      aria-label={muted ? "Unmute sounds" : "Mute sounds"}
      aria-pressed={muted}
      data-sfx-toggle
      className={cn(
        "group relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10",
        "text-on-surface-muted transition-[color,transform] duration-150 ease-out",
        "hover:text-accent-bright",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        "active:scale-[0.98] motion-reduce:transition-none"
      )}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="h-5 w-5 sm:h-6 sm:w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={SPEAKER_PATH} />

        <AnimatePresence initial={false} mode="wait">
          {muted ? (
            <motion.g
              key="muted"
              initial={
                reducedMotion
                  ? false
                  : { opacity: 0 }
              }
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration, ease: easeOut }}
            >
              <motion.line
                x1="22"
                x2="16"
                y1="9"
                y2="15"
                initial={
                  reducedMotion
                    ? false
                    : { pathLength: 0, opacity: 0 }
                }
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration, delay: reducedMotion ? 0 : 0.04, ease: easeOut }}
              />
              <motion.line
                x1="16"
                x2="22"
                y1="9"
                y2="15"
                initial={
                  reducedMotion
                    ? false
                    : { pathLength: 0, opacity: 0 }
                }
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration, delay: reducedMotion ? 0 : 0.1, ease: easeOut }}
              />
            </motion.g>
          ) : (
            <motion.g
              key="unmuted"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration, ease: easeOut }}
            >
              <motion.path
                d="M16 9a5 5 0 0 1 0 6"
                initial={reducedMotion ? false : { opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration,
                  delay: reducedMotion ? 0 : 0.04,
                  ease: easeOut,
                }}
                style={{ originX: "11px", originY: "12px" }}
              />
              <motion.path
                d="M19.364 18.364a9 9 0 0 0 0-12.728"
                initial={reducedMotion ? false : { opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration,
                  delay: reducedMotion ? 0 : 0.1,
                  ease: easeOut,
                }}
                style={{ originX: "11px", originY: "12px" }}
              />
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </button>
  );
}
