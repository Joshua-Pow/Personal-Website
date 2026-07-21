"use client";

import { Reveal } from "@/components/motion/Reveal";
import { enterDelays } from "@/lib/motion";

export function SubpageIntro({ children }: { children: React.ReactNode }) {
  return (
    <Reveal delay={enterDelays.intro} className="mb-8">
      {children}
    </Reveal>
  );
}
