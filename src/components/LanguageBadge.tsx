"use client";

import { motion } from "motion/react";
import { Logos } from "./Logos";
import { durations } from "@/lib/motion";

interface LanguageBadgeProps {
  logo: keyof typeof Logos;
  name: string;
}

export function LanguageBadge({ logo, name }: LanguageBadgeProps) {
  const LogoComponent = Logos[logo];

  return (
    <motion.div
      className="inline-flex items-center gap-1 rounded-full bg-elevated px-2.5 py-0.5 text-xs font-semibold shadow-sm hover:bg-[rgba(255,255,255,0.12)]"
      whileTap={{ scale: 0.98 }}
      transition={{ duration: durations.fast }}
    >
      <LogoComponent className="h-4 w-4" aria-hidden="true" />
      <span className="opacity-50">{name}</span>
    </motion.div>
  );
}
