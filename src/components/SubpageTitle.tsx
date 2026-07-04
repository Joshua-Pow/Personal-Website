"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Reveal } from "@/components/motion/Reveal";

type SubpageTitleProps = {
  children: React.ReactNode;
};

function getActiveViewTransition() {
  if (!("activeViewTransition" in document)) {
    return null;
  }

  return (
    document as Document & { activeViewTransition?: ViewTransition | null }
  ).activeViewTransition;
}

export function SubpageTitle({ children }: SubpageTitleProps) {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    const activeTransition = getActiveViewTransition();
    if (activeTransition) {
      let cancelled = false;
      void activeTransition.finished.then(() => {
        if (!cancelled) setVisible(true);
      });
      return () => {
        cancelled = true;
      };
    }

    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion]);

  if (!visible) {
    return (
      <h1 className="pt-12 font-medium opacity-0" aria-hidden>
        {children}
      </h1>
    );
  }

  return (
    <Reveal variant="blurIn" as="h1" className="pt-12 font-medium">
      {children}
    </Reveal>
  );
}
