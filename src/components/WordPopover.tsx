"use client";

import { useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { AnimatePresence, useReducedMotion } from "motion/react";
import { PopoverSurface } from "@/components/motion/PopoverSurface";
import { wordTrigger } from "@/lib/interactive";

type WordPopoverProps = {
  term: string;
  definition: string;
};

const popupClassName =
  "z-50 flex w-[min(18rem,calc(100vw-4rem))] origin-[var(--transform-origin)] gap-3 rounded-xl border border-[var(--popover-border)] bg-[var(--popover-bg)] px-4 py-3.5 shadow-[0_10px_30px_rgba(26,18,16,0.08),0_2px_8px_rgba(26,18,16,0.05)] backdrop-blur-md supports-[backdrop-filter]:bg-[var(--popover-bg)]";

export function WordPopover({ term, definition }: WordPopoverProps) {
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger className={wordTrigger}>
        {term}
      </Popover.Trigger>
      <AnimatePresence>
        {open && (
          <Popover.Portal keepMounted>
            <Popover.Positioner sideOffset={6} align="start">
              <Popover.Popup
                className={popupClassName}
                render={
                  <PopoverSurface
                    reducedMotion={reducedMotion ?? false}
                  />
                }
              >
                <span
                  className="mt-0.5 w-0.5 shrink-0 self-stretch rounded-full bg-accent-bright/80"
                  aria-hidden
                />
                <span className="flex min-w-0 flex-col gap-1.5">
                  <Popover.Title className="font-instrument text-[1.0625rem] leading-[1.25] tracking-[0.01em] text-on-surface">
                    {term}
                  </Popover.Title>
                  <Popover.Description className="text-sm leading-[1.55] tracking-tight text-on-surface-muted">
                    {definition}
                  </Popover.Description>
                </span>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        )}
      </AnimatePresence>
    </Popover.Root>
  );
}
