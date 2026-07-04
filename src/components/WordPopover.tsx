"use client";

import { useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { durations, getTransition } from "@/lib/motion";

type WordPopoverProps = {
  term: string;
  definition: string;
};

const triggerClassName =
  "cursor-help rounded-sm border-none bg-transparent p-0 font-inherit text-inherit underline decoration-orange-300/90 decoration-dotted underline-offset-[3px] transition-[color,text-decoration-color] duration-150 ease-out hover:text-orange-600 hover:decoration-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/40 focus-visible:ring-offset-1 motion-reduce:transition-none";

const popupClassName =
  "z-50 flex w-[min(18rem,calc(100vw-4rem))] origin-[var(--transform-origin)] gap-3 rounded-xl border border-orange-200/60 bg-orange-50/75 px-4 py-3.5 shadow-[0_10px_30px_rgba(234,88,12,0.1),0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-md focus:outline-none supports-[backdrop-filter]:bg-orange-50/65";

const popupHidden = { opacity: 0, y: 4, filter: "blur(2px)" };
const popupVisible = { opacity: 1, y: 0, filter: "blur(0px)" };

export function WordPopover({ term, definition }: WordPopoverProps) {
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const popupTransition = getTransition(durations.ui, reducedMotion ?? false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        className={triggerClassName}
        openOnHover
        delay={180}
        closeDelay={100}
      >
        {term}
      </Popover.Trigger>
      <AnimatePresence>
        {open && (
          <Popover.Portal keepMounted>
            <Popover.Positioner sideOffset={6} align="start">
              <Popover.Popup
                className={popupClassName}
                render={
                  <motion.div
                    initial={popupHidden}
                    animate={popupVisible}
                    exit={popupHidden}
                    transition={popupTransition}
                  />
                }
              >
                <span
                  className="mt-0.5 w-0.5 shrink-0 self-stretch rounded-full bg-orange-500/80"
                  aria-hidden
                />
                <span className="flex min-w-0 flex-col gap-1.5">
                  <Popover.Title className="font-instrument text-[1.0625rem] leading-[1.25] tracking-[0.01em] text-neutral-900">
                    {term}
                  </Popover.Title>
                  <Popover.Description className="text-sm leading-[1.55] tracking-tight text-neutral-600/90">
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
