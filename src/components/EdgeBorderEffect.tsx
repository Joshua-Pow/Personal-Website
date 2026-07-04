"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "motion/react";
import { easeIn, easeOut, durations } from "@/lib/motion";

interface EdgeBorderEffectProps {
  children: React.ReactNode;
  blurSlot?: React.ReactNode;
}

const CONFIG = {
  maxBorderWidth: 28,
  maxScale: 1,
  minScale: 0.985,
  maxBorderRadius: 16,
  edgeThresholdPx: 40,
  minSwipeDistance: 60,
} as const;

const CARD_GLOW_SHADOW = `
  0 -25px 50px -12px rgba(251, 146, 60, 0.12),
  0 25px 50px -12px rgba(251, 146, 60, 0.12),
  -25px 0 50px -12px rgba(251, 191, 36, 0.1),
  25px 0 50px -12px rgba(251, 191, 36, 0.1),
  inset 0 1px 0 rgba(255, 255, 255, 0.15)
`;

type EdgeIntensityContextValue = {
  intensity: MotionValue<number>;
};

const EdgeIntensityContext = createContext<EdgeIntensityContextValue | null>(
  null
);

export function useEdgeIntensity() {
  const ctx = useContext(EdgeIntensityContext);
  if (!ctx) {
    throw new Error("useEdgeIntensity must be used within EdgeBorderEffect");
  }
  return ctx;
}

function calculateDesktopIntensity(
  mouseX: number,
  mouseY: number,
  screenWidth: number,
  screenHeight: number,
  thresholdPx: number,
  maxBorderWidth: number
): number {
  const distances = {
    left: mouseX,
    right: screenWidth - mouseX,
    top: mouseY,
    bottom: screenHeight - mouseY,
  };

  const minDistance = Math.min(
    distances.left,
    distances.right,
    distances.top,
    distances.bottom
  );

  if (minDistance >= thresholdPx) {
    return 0;
  }

  const effectiveRange = thresholdPx - maxBorderWidth;
  return Math.min(1, (thresholdPx - minDistance) / effectiveRange);
}

export const EdgeBorderEffect = ({
  children,
  blurSlot,
}: EdgeBorderEffectProps) => {
  const intensity = useMotionValue(0);
  const rootFontSizeRef = useRef(16);
  const borderWidth = useTransform(
    intensity,
    (v) => `${v * CONFIG.maxBorderWidth}px`
  );
  const cardScale = useTransform(
    intensity,
    (v) => CONFIG.maxScale - v * (CONFIG.maxScale - CONFIG.minScale)
  );
  const cardSize = useTransform(cardScale, (v) => `${v * 100}%`);
  const borderRadius = useTransform(
    intensity,
    (v) => v * CONFIG.maxBorderRadius
  );
  const textOpacity = useTransform(intensity, (v) => Math.max(0, (v - 0.5) * 2));
  const backgroundOpacity = intensity;
  const glowOpacity = intensity;

  const rafIdRef = useRef<number | null>(null);
  const currentIntensityRef = useRef(0);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchStartEdgeRef = useRef<"left" | "right" | "top" | "bottom" | null>(
    null
  );
  const isMobileActiveRef = useRef(false);
  const [isMobileActive, setIsMobileActive] = useState(false);

  useEffect(() => {
    const updateRootFontSize = () => {
      rootFontSizeRef.current = parseFloat(
        getComputedStyle(document.documentElement).fontSize || "16"
      );
    };

    updateRootFontSize();
    window.addEventListener("resize", updateRootFontSize);

    return () => {
      window.removeEventListener("resize", updateRootFontSize);
    };
  }, []);

  useEffect(() => {
    isMobileActiveRef.current = isMobileActive;
  }, [isMobileActive]);

  const setIntensity = useCallback(
    (target: number) => {
      if (target === currentIntensityRef.current) return;
      const previous = currentIntensityRef.current;
      currentIntensityRef.current = target;
      animationRef.current?.stop();
      animationRef.current = animate(intensity, target, {
        duration: durations.ui,
        ease: target < previous ? easeIn : easeOut,
      });
    },
    [intensity]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        const thresholdPx = 3 * rootFontSizeRef.current;
        const nextIntensity = calculateDesktopIntensity(
          e.clientX,
          e.clientY,
          window.innerWidth,
          window.innerHeight,
          thresholdPx,
          CONFIG.maxBorderWidth
        );
        setIntensity(nextIntensity);
      });
    },
    [setIntensity]
  );

  const handleMouseLeave = useCallback(() => {
    setIntensity(0);
  }, [setIntensity]);

  const detectEdge = (
    x: number,
    y: number,
    width: number,
    height: number
  ): "left" | "right" | "top" | "bottom" | null => {
    if (x < CONFIG.edgeThresholdPx) return "left";
    if (x > width - CONFIG.edgeThresholdPx) return "right";
    if (y < CONFIG.edgeThresholdPx) return "top";
    if (y > height - CONFIG.edgeThresholdPx) return "bottom";
    return null;
  };

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    const edge = detectEdge(
      touch.clientX,
      touch.clientY,
      window.innerWidth,
      window.innerHeight
    );

    if (edge) {
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      touchStartEdgeRef.current = edge;
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!touchStartRef.current || !touchStartEdgeRef.current) return;

      const touch = e.touches[0];
      const start = touchStartRef.current;
      const edge = touchStartEdgeRef.current;

      let distance = 0;
      switch (edge) {
        case "left":
          distance = touch.clientX - start.x;
          break;
        case "right":
          distance = start.x - touch.clientX;
          break;
        case "top":
          distance = touch.clientY - start.y;
          break;
        case "bottom":
          distance = start.y - touch.clientY;
          break;
      }

      if (distance > 0) {
        const nextIntensity = Math.min(1, distance / CONFIG.minSwipeDistance);
        currentIntensityRef.current = nextIntensity;
        intensity.set(nextIntensity);

        if (nextIntensity > 0.5) {
          setIsMobileActive(true);
        }
      }
    },
    [intensity]
  );

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
    touchStartEdgeRef.current = null;

    if (currentIntensityRef.current > 0.5) {
      setIntensity(1);
      setIsMobileActive(true);
    } else {
      setIntensity(0);
      setIsMobileActive(false);
    }
  }, [setIntensity]);

  const handleTap = useCallback(
    (e: TouchEvent) => {
      if (isMobileActiveRef.current) {
        e.preventDefault();
        setIntensity(0);
        setIsMobileActive(false);
      }
    },
    [setIntensity]
  );

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    if (isTouchDevice) {
      window.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
      window.addEventListener("touchend", handleTouchEnd);
      window.addEventListener("touchcancel", handleTouchEnd);

      return () => {
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
        window.removeEventListener("touchcancel", handleTouchEnd);
      };
    }

    const attachDesktopListeners = () => {
      window.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseleave", handleMouseLeave);
    };

    const removeDesktopListeners = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(attachDesktopListeners);

      return () => {
        window.cancelIdleCallback(idleId);
        removeDesktopListeners();
      };
    }

    attachDesktopListeners();
    return removeDesktopListeners;
  }, [
    handleMouseMove,
    handleMouseLeave,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  ]);

  useEffect(() => {
    if (!isMobileActive) return;

    window.addEventListener("touchstart", handleTap);

    return () => {
      window.removeEventListener("touchstart", handleTap);
    };
  }, [isMobileActive, handleTap]);

  return (
    <EdgeIntensityContext.Provider value={{ intensity }}>
      <div
        className="fixed inset-0 overflow-hidden"
        style={{
          backgroundColor: "var(--page-bg)",
          backgroundImage: "var(--page-bg-gradient)",
        }}
      >
        <motion.div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            opacity: backgroundOpacity,
            backgroundColor: "var(--page-edge-color)",
          }}
        />

        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[30] flex items-center justify-center px-4"
          style={{
            opacity: textOpacity,
            height: borderWidth,
          }}
        >
          <p className="text-center font-instrument text-sm leading-none text-neutral-300">
            Made with love in Canada 🍁
          </p>
        </motion.div>

        <motion.div
          className="absolute inset-0 z-[20] flex items-center justify-center overflow-hidden"
          style={{ padding: borderWidth }}
        >
          <motion.div
            className="relative isolate overflow-hidden shadow-2xl"
            style={{
              width: cardSize,
              height: cardSize,
              borderRadius,
            }}
          >
            <motion.div
              className="pointer-events-none absolute -inset-8 rounded-[inherit]"
              style={{
                opacity: glowOpacity,
                boxShadow: CARD_GLOW_SHADOW,
              }}
            />

            <motion.div
              className="absolute inset-0 border border-black/5 bg-gradient-to-br from-[var(--surface-card-from)] via-[var(--surface-card-via)] to-[var(--surface-card-to)]"
              style={{ borderRadius }}
            />

            <motion.div
              className="pointer-events-none absolute inset-0 mix-blend-overlay"
              style={{
                borderRadius,
                opacity: "var(--page-noise-opacity)",
                backgroundImage: "var(--page-noise-image)",
                backgroundSize: "200px 200px",
              }}
            />

            <div className="relative z-10 h-full overflow-auto text-on-surface">
              {children}
            </div>

            {blurSlot ? (
              <motion.div
                className="pointer-events-none absolute inset-0 z-[25] overflow-hidden"
                style={{ borderRadius }}
              >
                {blurSlot}
              </motion.div>
            ) : null}
          </motion.div>
        </motion.div>
      </div>
    </EdgeIntensityContext.Provider>
  );
};
