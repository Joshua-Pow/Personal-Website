"use client";

import { useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { AnimatePresence, useReducedMotion } from "motion/react";
import { PopoverSurface } from "@/components/motion/PopoverSurface";
import { wordTrigger } from "@/lib/interactive";
import { cn } from "@/lib/utils/cn";

type LocationMapPopoverProps = {
  children: React.ReactNode;
  className?: string;
};

const popupClassName =
  "z-50 w-[min(15.5rem,calc(100vw-4rem))] origin-[var(--transform-origin)] overflow-hidden rounded-xl border border-[var(--popover-border)] bg-[var(--popover-bg)] shadow-[0_10px_30px_rgba(26,18,16,0.08),0_2px_8px_rgba(26,18,16,0.05)] backdrop-blur-md supports-[backdrop-filter]:bg-[var(--popover-bg)]";

function OntarioQuebecMap() {
  return (
    <svg
      viewBox="0 0 200 140"
      role="img"
      aria-label="Map showing Kitigan Zibi in Quebec and Toronto in Ontario"
      className="h-auto w-full"
    >
      <defs>
        <linearGradient id="map-water" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(94% 0.02 220)" />
          <stop offset="100%" stopColor="oklch(91% 0.03 215)" />
        </linearGradient>
        <linearGradient id="map-land" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="oklch(96% 0.018 62)" />
          <stop offset="100%" stopColor="oklch(93% 0.028 58)" />
        </linearGradient>
      </defs>

      <rect width="200" height="140" fill="url(#map-water)" />

      <path
        d="M 0 55 Q 35 48 70 52 T 140 50 Q 170 48 200 54 L 200 140 L 0 140 Z"
        fill="url(#map-land)"
      />
      <path
        d="M 0 38 Q 50 30 95 36 T 200 40 L 200 54 Q 170 48 140 50 T 70 52 Q 35 48 0 55 Z"
        fill="oklch(94% 0.022 65)"
        opacity="0.85"
      />

      <path
        d="M 52 44 Q 98 58 148 78"
        fill="none"
        stroke="oklch(60% 0.23 36 / 45%)"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        strokeLinecap="round"
      />

      <g>
        <circle cx="52" cy="44" r="5" fill="oklch(60% 0.23 36)" />
        <circle cx="52" cy="44" r="8" fill="none" stroke="oklch(60% 0.23 36 / 35%)" strokeWidth="1" />
        <text
          x="52"
          y="30"
          textAnchor="middle"
          fill="oklch(45% 0.02 55)"
          style={{ fontSize: "8px" }}
        >
          Kitigan Zibi
        </text>
        <text
          x="52"
          y="22"
          textAnchor="middle"
          fill="oklch(52% 0.025 55)"
          style={{ fontSize: "6.5px" }}
        >
          home
        </text>
      </g>

      <g>
        <circle cx="148" cy="78" r="5" fill="oklch(60% 0.23 36)" />
        <circle cx="148" cy="78" r="8" fill="none" stroke="oklch(60% 0.23 36 / 35%)" strokeWidth="1" />
        <text
          x="148"
          y="96"
          textAnchor="middle"
          fill="oklch(45% 0.02 55)"
          style={{ fontSize: "8px" }}
        >
          Toronto
        </text>
        <text
          x="148"
          y="104"
          textAnchor="middle"
          fill="oklch(52% 0.025 55)"
          style={{ fontSize: "6.5px" }}
        >
          now
        </text>
      </g>
    </svg>
  );
}

export function LocationMapPopover({
  children,
  className,
}: LocationMapPopoverProps) {
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        openOnHover
        delay={180}
        closeDelay={100}
        className={cn(wordTrigger, className)}
      >
        {children}
      </Popover.Trigger>
      <AnimatePresence>
        {open && (
          <Popover.Portal keepMounted>
            <Popover.Positioner sideOffset={6} align="start">
              <Popover.Popup
                className={popupClassName}
                render={
                  <PopoverSurface reducedMotion={reducedMotion ?? false} />
                }
              >
                <OntarioQuebecMap />
                <p className="border-t border-[var(--popover-border)] px-3.5 py-2.5 text-xs leading-[1.45] tracking-tight text-on-surface-muted">
                  From the Ottawa Valley to the city, about 450 km south.
                </p>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        )}
      </AnimatePresence>
    </Popover.Root>
  );
}
