"use client";

import { useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PopoverSurface } from "@/components/motion/PopoverSurface";
import { LinkPreviewPanel } from "@/components/link-preview/LinkPreviewPanel";
import { isBareEmbedPreview } from "@/components/link-preview/layouts";
import {
  bareEmbedPopupClassName,
  bareEmbedPositionerClassName,
  morphingPreviewPopupClassName,
  morphingPreviewPositionerClassName,
} from "@/components/link-preview/shared";
import { durations } from "@/lib/motion";

type LinkPreviewPopoverProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
};

export function LinkPreviewPopover({
  href,
  children,
  className,
  target = "_blank",
  rel = "noopener noreferrer",
}: LinkPreviewPopoverProps) {
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const isBare = isBareEmbedPreview(href);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        nativeButton={false}
        openOnHover
        delay={220}
        closeDelay={120}
        render={
          <motion.a
            href={href}
            target={target}
            rel={rel}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: durations.fast }}
            className={className}
          />
        }
      >
        {children}
      </Popover.Trigger>
      <AnimatePresence>
        {open && (
          <Popover.Portal keepMounted>
            <Popover.Positioner
              sideOffset={8}
              align="start"
              className={
                isBare ? bareEmbedPositionerClassName : morphingPreviewPositionerClassName
              }
            >
              <Popover.Popup
                className={isBare ? bareEmbedPopupClassName : morphingPreviewPopupClassName}
                render={
                  <PopoverSurface reducedMotion={reducedMotion ?? false} />
                }
              >
                <LinkPreviewPanel href={href} />
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        )}
      </AnimatePresence>
    </Popover.Root>
  );
}
