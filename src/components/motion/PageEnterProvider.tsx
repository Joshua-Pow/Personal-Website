import { useRouterState } from "@tanstack/react-router";
import { useReducedMotion } from "motion/react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

interface PageEnterContextValue {
  ready: boolean;
}

const PageEnterContext = createContext<PageEnterContextValue>({ ready: true });

/** Max wait for a View Transition before revealing content anyway (mobile Safari can hang). */
const VIEW_TRANSITION_READY_TIMEOUT_MS = 800;

function getActiveViewTransition() {
  if (!("activeViewTransition" in document)) {
    return null;
  }

  // SAFETY: Chromium exposes `document.activeViewTransition` after we confirmed
  // the property exists; lib.dom's Document type does not include it yet.
  const { activeViewTransition } = document as Document & {
    activeViewTransition?: ViewTransition | null;
  };
  return activeViewTransition;
}

async function whenViewTransitionFinishes(transition: ViewTransition) {
  try {
    await transition.finished;
  } catch {
    // VT can abort (timeout in DOM update); fall through to reveal.
  }
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
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const reducedMotion = useReducedMotion();
  /** Path the gate has cleared — compared to `pathname` so ready flips false immediately on nav. */
  const [readyPath, setReadyPath] = useState<string | null>(null);
  const ready = readyPath === pathname;
  const contextValue = useMemo(() => ({ ready }), [ready]);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let outerFrame = 0;
    let innerFrame = 0;

    const markReady = () => {
      if (cancelled) {
        return;
      }
      setReadyPath(pathname);
    };

    const revealAfterPaint = () => {
      outerFrame = requestAnimationFrame(() => {
        innerFrame = requestAnimationFrame(markReady);
      });
    };

    const cleanup = () => {
      cancelled = true;
      cancelAnimationFrame(outerFrame);
      cancelAnimationFrame(innerFrame);
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };

    if (reducedMotion) {
      revealAfterPaint();
      return cleanup;
    }

    const activeTransition = getActiveViewTransition();
    if (activeTransition) {
      timeoutId = setTimeout(markReady, VIEW_TRANSITION_READY_TIMEOUT_MS);
      void (async () => {
        await whenViewTransitionFinishes(activeTransition);
        if (cancelled) {
          return;
        }
        revealAfterPaint();
      })();
      return cleanup;
    }

    revealAfterPaint();
    return cleanup;
  }, [pathname, reducedMotion]);

  return (
    <PageEnterContext.Provider value={contextValue}>
      {children}
    </PageEnterContext.Provider>
  );
}

export function usePageEnterReady() {
  return useContext(PageEnterContext).ready;
}
