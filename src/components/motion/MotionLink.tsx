"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { durations } from "@/lib/motion";
import { interactiveLink } from "@/lib/interactive";
import { cn } from "@/lib/utils/cn";
import { LinkPreviewPopover } from "@/components/LinkPreviewPopover";

const MotionNextLink = motion.create(Link);

type MotionLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  preview?: boolean;
  /** When false, skips default orange link text color */
  accent?: boolean;
};

export function MotionLink({
  href,
  children,
  className,
  target,
  rel,
  preview = true,
  accent = true,
}: MotionLinkProps) {
  const isExternal = href.startsWith("http");
  const resolvedRel =
    rel ?? (target === "_blank" ? "noopener noreferrer" : undefined);
  const mergedClassName = cn(accent && interactiveLink(), className);

  const motionProps = {
    whileTap: { scale: 0.98 },
    transition: { duration: durations.fast },
    className: mergedClassName,
  };

  if (isExternal) {
    if (preview) {
      return (
        <LinkPreviewPopover
          href={href}
          className={mergedClassName}
          target={target}
          rel={resolvedRel}
        >
          {children}
        </LinkPreviewPopover>
      );
    }

    return (
      <motion.a
        href={href}
        target={target}
        rel={resolvedRel}
        {...motionProps}
      >
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
