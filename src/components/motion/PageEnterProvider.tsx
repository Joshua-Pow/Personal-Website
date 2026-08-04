"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "motion/react";

type PageEnterContextValue = {
  ready: boolean;
};

const PageEnterContext = createContext<PageEnterContextValue>({ ready: true });

/** Max wait for a View Transition before revealing content anyway (mobile Safari can hang). */
const VIEW_TRANSITION_READY_TIMEOUT_MS = 800;

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
 * (or after the first paint on cold loads). Re-arms on every pathname change
 * so client navigations don't start Motion reveals during the shared-element VT.
 *
 * Always includes a timeout fallback — if a VT stalls (common on mobile), content
 * must still become visible.
 */
export function PageEnterProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  /** Path the gate has cleared — compared to `pathname` so ready flips false immediately on nav. */
  const [readyPath, setReadyPath] = useState<string | null>(null);
  const ready = readyPath === pathname;

  useEffect(() => {
    let cancelled = false;
    let cancelPaint: (() => void) | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const markReady = () => {
      if (cancelled) return;
      setReadyPath(pathname);
    };

    const armTimeout = () => {
      timeoutId = setTimeout(markReady, VIEW_TRANSITION_READY_TIMEOUT_MS);
    };

    const cleanup = () => {
      cancelled = true;
      cancelPaint?.();
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };

    if (reducedMotion) {
      cancelPaint = afterNextPaint(markReady);
      return cleanup;
    }

    const activeTransition = getActiveViewTransition();
    if (activeTransition) {
      armTimeout();
      void activeTransition.finished
        .catch(() => {
          // VT can abort (timeout in DOM update); fall through to reveal.
        })
        .then(() => {
          if (cancelled) return;
          cancelPaint = afterNextPaint(markReady);
        });
      return cleanup;
    }

    cancelPaint = afterNextPaint(markReady);
    return cleanup;
  }, [pathname, reducedMotion]);

  return (
    <PageEnterContext.Provider value={{ ready }}>
      {children}
    </PageEnterContext.Provider>
  );
}

export function usePageEnterReady() {
  return useContext(PageEnterContext).ready;
}
