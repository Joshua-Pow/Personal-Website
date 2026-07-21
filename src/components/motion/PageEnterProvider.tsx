"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useReducedMotion } from "motion/react";

type PageEnterContextValue = {
  ready: boolean;
};

const PageEnterContext = createContext<PageEnterContextValue>({ ready: true });

function getActiveViewTransition() {
  if (!("activeViewTransition" in document)) {
    return null;
  }

  return (
    document as Document & { activeViewTransition?: ViewTransition | null }
  ).activeViewTransition;
}

function afterNextPaint(callback: () => void) {
  let outer = 0;
  let inner = 0;
  outer = requestAnimationFrame(() => {
    inner = requestAnimationFrame(callback);
  });
  return () => {
    cancelAnimationFrame(outer);
    cancelAnimationFrame(inner);
  };
}

/**
 * Gates page-enter reveals until after an active view transition finishes
 * (or after the first paint on cold loads).
 */
export function PageEnterProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      return afterNextPaint(() => setReady(true));
    }

    const activeTransition = getActiveViewTransition();
    if (activeTransition) {
      let cancelled = false;
      let cancelPaint: (() => void) | undefined;
      void activeTransition.finished.then(() => {
        if (cancelled) return;
        cancelPaint = afterNextPaint(() => {
          if (!cancelled) setReady(true);
        });
      });
      return () => {
        cancelled = true;
        cancelPaint?.();
      };
    }

    return afterNextPaint(() => setReady(true));
  }, [reducedMotion]);

  return (
    <PageEnterContext.Provider value={{ ready }}>
      {children}
    </PageEnterContext.Provider>
  );
}

export function usePageEnterReady() {
  return useContext(PageEnterContext).ready;
}
