"use client";

import { useEffect, useRef } from "react";
import { useSyncExternalStore } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { cn } from "@/lib/utils/cn";
import { easeOut } from "@/lib/motion";
import {
  getMetronomeAngle,
  getTickSoundMutedServerSnapshot,
  getTickSoundMutedSnapshot,
  PIVOT,
  subscribeTickSoundMuted,
  toggleTickSoundMuted,
} from "@/lib/tick-sound";

const ARM_LENGTH = 10.3;
const REST_ANGLE = -11;
const RESUME_MS = 380;

const pendulumSpring = {
  type: "spring" as const,
  stiffness: 220,
  damping: 16,
  mass: 0.7,
};

function PendulumArm({ isStill }: { isStill: boolean }) {
  const angle = useMotionValue(getMetronomeAngle());
  const wasStillRef = useRef(isStill);

  useEffect(() => {
    let frameId = 0;
    let cancelled = false;
    const resuming = wasStillRef.current && !isStill;
    wasStillRef.current = isStill;

    if (isStill) {
      const controls = animate(angle, REST_ANGLE, pendulumSpring);
      return () => {
        cancelled = true;
        controls.stop();
        cancelAnimationFrame(frameId);
      };
    }

    const resumeStart = resuming ? performance.now() : null;

    const update = () => {
      if (cancelled) return;

      const target = getMetronomeAngle();

      if (resumeStart !== null) {
        const elapsed = performance.now() - resumeStart;
        const blend = Math.min(elapsed / RESUME_MS, 1);
        const easedBlend = 1 - (1 - blend) ** 3;
        const followStrength = 0.1 + easedBlend * 0.9;
        const current = angle.get();
        angle.set(current + (target - current) * followStrength);
      } else {
        angle.set(target);
      }

      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
    };
  }, [angle, isStill]);

  const tipX = useTransform(
    angle,
    (degrees) => PIVOT.x + ARM_LENGTH * Math.sin((degrees * Math.PI) / 180)
  );
  const tipY = useTransform(
    angle,
    (degrees) => PIVOT.y - ARM_LENGTH * Math.cos((degrees * Math.PI) / 180)
  );

  return (
    <>
      <circle
        cx={PIVOT.x}
        cy={PIVOT.y}
        r="0.95"
        fill="currentColor"
        stroke="none"
      />
      <motion.line
        x1={PIVOT.x}
        y1={PIVOT.y}
        x2={tipX}
        y2={tipY}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <motion.circle
        cx={tipX}
        cy={tipY}
        r="1.55"
        fill="currentColor"
        stroke="none"
      />
    </>
  );
}

export function TickSoundToggle() {
  const reducedMotion = useReducedMotion();
  const muted = useSyncExternalStore(
    subscribeTickSoundMuted,
    getTickSoundMutedSnapshot,
    getTickSoundMutedServerSnapshot
  );

  const isStill = Boolean(muted || reducedMotion);

  return (
    <button
      type="button"
      onClick={toggleTickSoundMuted}
      aria-label={muted ? "Unmute counter ticking" : "Mute counter ticking"}
      aria-pressed={muted}
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
        className="h-6 w-6 overflow-visible sm:h-7 sm:w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7.75 19.5h8.5l-1.65-11.25H9.4L7.75 19.5z" />
        <path d="M9.4 8.25h5.2" opacity="0.4" />

        <PendulumArm isStill={isStill} />

        <motion.g
          initial={false}
          animate={{
            opacity: muted ? 1 : 0,
            y: muted ? 0 : 2,
            scale: muted ? 1 : 0.85,
          }}
          transition={{ duration: 0.22, ease: easeOut }}
        >
          <path
            d="M15.1 4.2c0.45 0.2 0.85 0.45 1.15 0.8"
            strokeWidth="1.15"
            opacity="0.7"
          />
          <path
            d="M16.35 2.55c0.65 0.35 1.1 0.9 1.35 1.55"
            strokeWidth="0.95"
            opacity="0.45"
          />
        </motion.g>

        <motion.g
          initial={false}
          animate={{
            opacity: muted ? 0 : 1,
            scale: muted ? 0.82 : 1,
          }}
          transition={{ duration: 0.2, ease: easeOut }}
        >
          <path d="M4.55 11.35c0.75-0.45 1.6-0.65 2.45-0.45" strokeWidth="1.05" />
          <path d="M3.95 13.75c0.95-0.25 1.9-0.15 2.75 0.35" strokeWidth="1.05" />
          <path d="M4.65 16.15c0.85 0.35 1.75 0.55 2.65 0.35" strokeWidth="1.05" />
        </motion.g>
      </svg>
    </button>
  );
}
