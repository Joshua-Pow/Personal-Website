"use client";

import { useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { durations, getTransition } from "@/lib/motion";
import { LinkPreviewPanel } from "@/components/link-preview/LinkPreviewPanel";
import { isBareEmbedPreview } from "@/components/link-preview/layouts";
import {
  bareEmbedPopupClassName,
  bareEmbedPositionerClassName,
  morphingPreviewPopupClassName,
  morphingPreviewPositionerClassName,
} from "@/components/link-preview/shared";

type LinkPreviewPopoverProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
};

const popupHidden = { opacity: 0, y: 4, filter: "blur(2px)" };
const popupVisible = { opacity: 1, y: 0, filter: "blur(0px)" };

export function LinkPreviewPopover({
  href,
  children,
  className,
  target = "_blank",
  rel = "noopener noreferrer",
}: LinkPreviewPopoverProps) {
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const popupTransition = getTransition(durations.ui, reducedMotion ?? false);
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
              {isBare ? (
                <Popover.Popup className={bareEmbedPopupClassName}>
                  <LinkPreviewPanel href={href} />
                </Popover.Popup>
              ) : (
                <Popover.Popup
                  className={morphingPreviewPopupClassName}
                  render={
                    <motion.div
                      initial={popupHidden}
                      animate={popupVisible}
                      exit={popupHidden}
                      transition={popupTransition}
                    />
                  }
                >
                  <LinkPreviewPanel href={href} />
                </Popover.Popup>
              )}
            </Popover.Positioner>
          </Popover.Portal>
        )}
      </AnimatePresence>
    </Popover.Root>
  );
}
