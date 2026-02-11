"use client";

import { useEffect, useCallback, useRef, useState } from "react";

interface EdgeBorderEffectProps {
  children: React.ReactNode;
  blurSlot?: React.ReactNode;
}

// Configuration constants
const CONFIG = {
  maxBorderWidth: 24,
  animationDuration: 200,
  maxScale: 1,
  minScale: 0.985,
  maxBorderRadius: 16,
  // Mobile: swipe must start within this many pixels from edge
  edgeThresholdPx: 40,
  // Mobile: minimum swipe distance to trigger
  minSwipeDistance: 60,
} as const;

/**
 * Calculates the animation intensity based on cursor proximity to screen edges.
 */
function calculateDesktopIntensity(
  mouseX: number,
  mouseY: number,
  screenWidth: number,
  screenHeight: number,
  thresholdRem: number,
  maxBorderWidth: number
): number {
  const rootFontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize || "16"
  );
  const thresholdPx = thresholdRem * rootFontSize;

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

/**
 * EdgeBorderEffect - Desktop: hover near edges, Mobile: swipe from edges
 *
 * Uses Tailwind classes with CSS variables for dynamic values.
 * Zero React re-renders - all animations via CSS custom properties.
 */
export const EdgeBorderEffect = ({
  children,
  blurSlot,
}: EdgeBorderEffectProps) => {
  // Refs for DOM elements
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  // Refs for animation control
  const rafIdRef = useRef<number | null>(null);
  const currentIntensityRef = useRef(0);

  // Mobile touch tracking
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchStartEdgeRef = useRef<"left" | "right" | "top" | "bottom" | null>(
    null
  );
  const [isMobileActive, setIsMobileActive] = useState(false);

  /**
   * Updates all visual elements based on intensity (0-1).
   * Modifies CSS custom properties directly - zero React re-renders.
   */
  const applyIntensity = useCallback((intensity: number) => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    const background = backgroundRef.current;
    const message = messageRef.current;

    if (!wrapper || !content || !background || !message) return;

    const borderWidth = intensity * CONFIG.maxBorderWidth;
    const scale =
      CONFIG.maxScale - intensity * (CONFIG.maxScale - CONFIG.minScale);
    const textOpacity = Math.max(0, (intensity - 0.5) * 2);

    wrapper.style.setProperty("--border-width", `${borderWidth}px`);
    wrapper.style.setProperty("--scale", scale.toString());
    wrapper.style.setProperty("--intensity", intensity.toString());
    background.style.setProperty("--intensity", intensity.toString());
    message.style.setProperty("--text-opacity", textOpacity.toString());
  }, []);

  /**
   * Desktop: Handles mouse movement with RAF throttling.
   */
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        const intensity = calculateDesktopIntensity(
          e.clientX,
          e.clientY,
          window.innerWidth,
          window.innerHeight,
          3, // thresholdRem
          CONFIG.maxBorderWidth
        );

        if (intensity !== currentIntensityRef.current) {
          currentIntensityRef.current = intensity;
          applyIntensity(intensity);
        }
      });
    },
    [applyIntensity]
  );

  const handleMouseLeave = useCallback(() => {
    currentIntensityRef.current = 1;
    applyIntensity(1);
  }, [applyIntensity]);

  /**
   * Mobile: Detect which edge a touch started from.
   */
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

  /**
   * Mobile: Handle touch start - check if starting from edge.
   */
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

  /**
   * Mobile: Handle touch move - animate based on swipe distance.
   */
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!touchStartRef.current || !touchStartEdgeRef.current) return;

      const touch = e.touches[0];
      const start = touchStartRef.current;
      const edge = touchStartEdgeRef.current;

      // Calculate swipe distance based on which edge
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

      // Only respond to swipes inward (positive distance)
      if (distance > 0) {
        const intensity = Math.min(1, distance / CONFIG.minSwipeDistance);
        currentIntensityRef.current = intensity;
        applyIntensity(intensity);

        if (intensity > 0.5) {
          setIsMobileActive(true);
        }
      }
    },
    [applyIntensity]
  );

  /**
   * Mobile: Handle touch end - snap to 0 or 1 based on current position.
   */
  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
    touchStartEdgeRef.current = null;

    if (currentIntensityRef.current > 0.5) {
      currentIntensityRef.current = 1;
      applyIntensity(1);
      setIsMobileActive(true);
    } else {
      currentIntensityRef.current = 0;
      applyIntensity(0);
      setIsMobileActive(false);
    }
  }, [applyIntensity]);

  /**
   * Mobile: Tap to dismiss when effect is active.
   */
  const handleTap = useCallback(
    (e: TouchEvent) => {
      if (isMobileActive) {
        e.preventDefault();
        currentIntensityRef.current = 0;
        applyIntensity(0);
        setIsMobileActive(false);
      }
    },
    [isMobileActive, applyIntensity]
  );

  useEffect(() => {
    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    // Check if touch device
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    if (isTouchDevice) {
      // Mobile: Touch events
      window.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
      window.addEventListener("touchend", handleTouchEnd);
      window.addEventListener("touchcancel", handleTouchEnd);

      // Tap to dismiss when active
      if (isMobileActive) {
        window.addEventListener("touchstart", handleTap);
      }

      return () => {
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
        window.removeEventListener("touchcancel", handleTouchEnd);
        window.removeEventListener("touchstart", handleTap);
      };
    } else {
      // Desktop: Mouse events
      window.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseleave", handleMouseLeave);
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
        }
      };
    }
  }, [
    handleMouseMove,
    handleMouseLeave,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTap,
    isMobileActive,
  ]);

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Dark background layer - shows through border */}
      <div
        ref={backgroundRef}
        className="pointer-events-none absolute inset-0 z-0 opacity-[var(--intensity,0)] transition-opacity duration-200 ease-out"
        style={{
          background: `radial-gradient(ellipse at center, #1a1a1a 0%, #0a0a0a 100%)`,
        }}
      />

      {/* Footer message */}
      <div
        ref={messageRef}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[30] flex items-center justify-center opacity-[var(--text-opacity,0)] transition-opacity duration-200 ease-out"
        style={{ height: `${CONFIG.maxBorderWidth}px` }}
      >
        <p className="text-center font-instrument text-base text-neutral-200">
          Made with love in Canada 🍁
        </p>
      </div>

      {/* Content wrapper - creates border space via padding */}
      <div
        ref={wrapperRef}
        className="absolute inset-0 z-[20] overflow-hidden p-[var(--border-width,0px)] transition-all duration-200 ease-out"
      >
        {/* Scaled content container */}
        <div
          ref={contentRef}
          className="relative isolate h-full w-full overflow-hidden rounded-[calc(var(--intensity,0)*16px)] shadow-2xl transition-all duration-200 ease-out"
          style={{
            // shadows to create depth on all sides
            boxShadow: `
              /* Top shadow */
              0 -25px 50px -12px rgba(251, 146, 60, calc(var(--intensity, 0) * 0.12)),
              /* Bottom shadow */
              0 25px 50px -12px rgba(251, 146, 60, calc(var(--intensity, 0) * 0.12)),
              /* Left shadow */
              -25px 0 50px -12px rgba(251, 191, 36, calc(var(--intensity, 0) * 0.1)),
              /* Right shadow */
              25px 0 50px -12px rgba(251, 191, 36, calc(var(--intensity, 0) * 0.1)),
              /* Inner highlight */
              inset 0 1px 0 rgba(255, 255, 255, calc(var(--intensity, 0) * 0.15))
            `,
          }}
        >
          {/* Background */}
          <div className="absolute inset-0 rounded-[calc(var(--intensity,0)*16px)] border border-black/5 bg-gradient-to-br from-orange-50 via-orange-100 to-yellow-50" />

          {/* Content */}
          <div className="relative z-10 h-full overflow-auto">
            {children}
          </div>

          {/* Bottom blur overlay - full width, clipped to same rounded content shape */}
          {blurSlot ? (
            <div
              className="pointer-events-none absolute inset-0 z-[25] overflow-hidden rounded-[calc(var(--intensity,0)*16px)]"
            >
              {blurSlot}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
