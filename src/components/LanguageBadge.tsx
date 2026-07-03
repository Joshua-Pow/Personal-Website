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
      className="inline-flex items-center gap-1 rounded-full bg-white/50 px-2.5 py-0.5 text-xs font-semibold shadow-sm hover:bg-white/80"
      whileTap={{ scale: 0.98 }}
      transition={{ duration: durations.fast }}
    >
      <LogoComponent className="h-4 w-4" />
      <span className="opacity-50">{name}</span>
    </motion.div>
  );
}
