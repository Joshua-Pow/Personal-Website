"use client";

import { MotionConfig } from "motion/react";
import { PageEnterProvider } from "@/components/motion/PageEnterProvider";

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <PageEnterProvider>{children}</PageEnterProvider>
    </MotionConfig>
  );
}
