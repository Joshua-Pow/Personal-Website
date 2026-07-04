"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils/cn";
import { easeOut } from "@/lib/motion";

type TickSoundToggleProps = {
  muted: boolean;
  onToggle: () => void;
};

export function TickSoundToggle({ muted, onToggle }: TickSoundToggleProps) {
  const reducedMotion = useReducedMotion();

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={muted ? "Unmute counter ticking" : "Mute counter ticking"}
      aria-pressed={muted}
      className={cn(
        "group relative -mb-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md sm:h-7 sm:w-7",
        "text-on-surface-muted transition-[color,transform] duration-150 ease-out",
        "hover:text-accent-bright",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        "active:scale-[0.92] motion-reduce:transition-none"
      )}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="h-4 w-4 overflow-visible sm:h-[18px] sm:w-[18px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7.5 19.5h9l-1.75-13.5H9.25L7.5 19.5z" />
        <path d="M9.25 6h5.5" opacity="0.45" />

        <circle cx="12" cy="6.25" r="0.9" fill="currentColor" stroke="none" />

        <motion.g
          style={{ transformOrigin: "12px 6.25px" }}
          animate={
            muted || reducedMotion
              ? { rotate: -14 }
              : { rotate: [-20, 20, -20] }
          }
          transition={
            muted || reducedMotion
              ? { duration: 0.22, ease: easeOut }
              : {
                  duration: 0.72,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        >
          <line x1="12" y1="6.25" x2="12" y2="14.5" />
          <circle cx="12" cy="15.5" r="1.35" fill="currentColor" stroke="none" />
        </motion.g>

        <motion.g
          initial={false}
          animate={{
            opacity: muted ? 1 : 0,
            y: muted ? 0 : 3,
            scale: muted ? 1 : 0.85,
          }}
          transition={{ duration: 0.2, ease: easeOut }}
        >
          <path
            d="M14.8 4.1c0.5 0.2 0.9 0.5 1.2 0.9"
            strokeWidth="1.3"
            opacity="0.7"
          />
          <path
            d="M16.1 2.4c0.7 0.4 1.2 1 1.5 1.7"
            strokeWidth="1.1"
            opacity="0.45"
          />
        </motion.g>

        <motion.g
          initial={false}
          animate={{
            opacity: muted ? 0 : 1,
            scale: muted ? 0.8 : 1,
          }}
          transition={{ duration: 0.18, ease: easeOut }}
        >
          <path d="M4.8 11.2c0.8-0.5 1.7-0.7 2.6-0.5" strokeWidth="1.2" />
          <path d="M4.2 13.6c1-0.3 2-0.2 2.9 0.3" strokeWidth="1.2" />
          <path d="M4.9 16c0.9 0.4 1.8 0.6 2.7 0.4" strokeWidth="1.2" />
        </motion.g>
      </svg>
    </button>
  );
}
