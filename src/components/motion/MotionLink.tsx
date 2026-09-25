import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";

import { LinkPreviewPopover } from "@/components/LinkPreviewPopover";
import { interactiveLink } from "@/lib/interactive";
import { durations } from "@/lib/motion";
import { cn } from "@/lib/utils/cn";

const MotionRouterLink = motion.create(Link);

type InternalPath = "/" | "/history" | "/adages" | "/notes";

interface MotionLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  preview?: boolean;
  /** When false, skips default orange link text color */
  accent?: boolean;
}

function isInternalPath(href: string): href is InternalPath {
  return (
    href === "/" ||
    href === "/history" ||
    href === "/adages" ||
    href === "/notes"
  );
}

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

  const sfxAttrs = {
    "data-sfx-hover": "tick",
    "data-sfx-press": true,
    "data-sfx-release": true,
  } as const;

  const motionProps = {
    whileTap: { scale: 0.98 },
    transition: { duration: durations.fast },
    className: mergedClassName,
    ...sfxAttrs,
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
      <motion.a href={href} target={target} rel={resolvedRel} {...motionProps}>
        {children}
      </motion.a>
    );
  }

  if (!isInternalPath(href)) {
    return (
      <motion.a href={href} target={target} rel={resolvedRel} {...motionProps}>
        {children}
      </motion.a>
    );
  }

  return (
    <MotionRouterLink to={href} {...motionProps}>
      {children}
    </MotionRouterLink>
  );
}
