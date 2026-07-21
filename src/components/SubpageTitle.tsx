"use client";

import { Reveal } from "@/components/motion/Reveal";
import { enterDelays } from "@/lib/motion";

type SubpageTitleProps = {
  children: React.ReactNode;
};

export function SubpageTitle({ children }: SubpageTitleProps) {
  return (
    <Reveal
      as="h1"
      delay={enterDelays.title}
      className="pt-12 font-medium"
    >
      {children}
    </Reveal>
  );
}
