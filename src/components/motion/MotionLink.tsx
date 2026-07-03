"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { durations } from "@/lib/motion";

const MotionNextLink = motion.create(Link);

type MotionLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
};

export function MotionLink({
  href,
  children,
  className,
  target,
  rel,
}: MotionLinkProps) {
  const isExternal = href.startsWith("http");

  const motionProps = {
    whileTap: { scale: 0.98 },
    transition: { duration: durations.fast },
    className,
  };

  if (isExternal) {
    return (
      <motion.a href={href} target={target} rel={rel} {...motionProps}>
        {children}
      </motion.a>
    );
  }

  return (
    <MotionNextLink href={href} {...motionProps}>
      {children}
    </MotionNextLink>
  );
}
