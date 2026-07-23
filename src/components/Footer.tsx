"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { motion } from "motion/react";
import { durations } from "@/lib/motion";
import { LinkPreviewPanel } from "@/components/link-preview/LinkPreviewPanel";
import { isBareEmbedPreview } from "@/components/link-preview/layouts";
import {
  footerMorphingPreviewPositionerClassName,
  footerPreviewPopupClassName,
  footerPreviewViewportSwipeClassName,
  prefetchPreview,
} from "@/components/link-preview/shared";
import { interactiveMuted } from "@/lib/interactive";

type FooterLink = {
  href: string;
  label: string;
};

const links: FooterLink[] = [
  { href: "https://x.com/joshpow_", label: "@JoshPow" },
  { href: "https://github.com/joshua-pow", label: "github" },
  { href: "https://linkedin.com/in/joshuapow", label: "linkedin" },
];

const footerPopover = Popover.createHandle<FooterLink>();

const HOVER_OPEN_DELAY = 120;
const HOVER_CLOSE_DELAY = 400;

function getPreviewAlign(link: FooterLink | null) {
  if (!link) return "center";
  const index = links.findIndex((item) => item.href === link.href);
  if (index <= 0) return "start";
  if (index >= links.length - 1) return "end";
  return "center";
}

export function Footer() {
  const [activeLink, setActiveLink] = useState<FooterLink | null>(null);
  const activeLinkRef = useRef<FooterLink | null>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const prefetchedLinksRef = useRef<Set<string>>(new Set());
  const openedByPointerRef = useRef(false);

  useEffect(() => {
    activeLinkRef.current = activeLink;
  }, [activeLink]);

  useEffect(() => {
    const markPointerOpen = () => {
      openedByPointerRef.current = true;
    };
    const markKeyboardOpen = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        openedByPointerRef.current = false;
      }
    };

    window.addEventListener("pointerdown", markPointerOpen, true);
    window.addEventListener("keydown", markKeyboardOpen, true);
    return () => {
      window.removeEventListener("pointerdown", markPointerOpen, true);
      window.removeEventListener("keydown", markKeyboardOpen, true);
    };
  }, []);

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = undefined;
    }
  }, []);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = undefined;
    }
  }, []);

  const blurFocusedFooterTrigger = useCallback(() => {
    const active = document.activeElement;
    if (!(active instanceof HTMLElement)) return;
    if (active.closest("footer")) {
      active.blur();
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setActiveLink(null);
      blurFocusedFooterTrigger();
    }, HOVER_CLOSE_DELAY);
  }, [clearCloseTimer, blurFocusedFooterTrigger]);

  useEffect(() => {
    if (!activeLink || !openedByPointerRef.current) return;
    requestAnimationFrame(() => {
      blurFocusedFooterTrigger();
    });
  }, [activeLink, blurFocusedFooterTrigger]);

  const prefetchLink = useCallback((href: string) => {
    if (prefetchedLinksRef.current.has(href)) return;
    prefetchedLinksRef.current.add(href);
    void prefetchPreview(href);
  }, []);

  const handleLinkEnter = useCallback(
    (link: FooterLink) => {
      openedByPointerRef.current = true;
      prefetchLink(link.href);
      clearCloseTimer();

      if (activeLinkRef.current !== null) {
        clearOpenTimer();
        setActiveLink(link);
        return;
      }

      clearOpenTimer();
      openTimerRef.current = setTimeout(() => {
        setActiveLink(link);
      }, HOVER_OPEN_DELAY);
    },
    [clearCloseTimer, clearOpenTimer, prefetchLink]
  );

  const handlePreviewEnter = useCallback(() => {
    clearCloseTimer();
    clearOpenTimer();
  }, [clearCloseTimer, clearOpenTimer]);

  useEffect(() => {
    return () => {
      clearOpenTimer();
      clearCloseTimer();
    };
  }, [clearCloseTimer, clearOpenTimer]);

  return (
    <footer
      className="mb-24 mt-8 flex w-full items-center justify-center"
      onMouseLeave={() => {
        scheduleClose();
        blurFocusedFooterTrigger();
      }}
    >
      <div className="flex items-center gap-2">
        {links.map((link) => (
          <Popover.Trigger
            key={link.href}
            id={link.href}
            handle={footerPopover}
            payload={link}
            nativeButton={false}
            render={
              <motion.a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.98 }}
                transition={{ duration: durations.fast }}
                className={interactiveMuted(
                  "rounded-sm px-2 py-1",
                  "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
                  "data-kbd-focus:focus-visible:ring-2 data-kbd-focus:focus-visible:ring-accent-bright data-kbd-focus:focus-visible:ring-offset-2 data-kbd-focus:focus-visible:ring-offset-surface-offset"
                )}
                data-sfx-hover="tick"
                data-sfx-press
                data-sfx-release
                onMouseEnter={() => handleLinkEnter(link)}
                onMouseLeave={(event) => event.currentTarget.blur()}
                onFocus={(event) => {
                  prefetchLink(link.href);
                  if (openedByPointerRef.current) {
                    event.currentTarget.blur();
                    return;
                  }
                  event.currentTarget.setAttribute("data-kbd-focus", "");
                }}
                onBlur={(event) => {
                  event.currentTarget.removeAttribute("data-kbd-focus");
                }}
              />
            }
          >
            {link.label}
          </Popover.Trigger>
        ))}
      </div>

      <Popover.Root
        handle={footerPopover}
        open={activeLink !== null}
        triggerId={activeLink?.href ?? null}
        onOpenChange={(open) => {
          if (!open) {
            clearOpenTimer();
            clearCloseTimer();
            setActiveLink(null);
            blurFocusedFooterTrigger();
          }
        }}
      >
        {({ payload }) => {
          const isBare =
            payload !== undefined && isBareEmbedPreview(payload.href);

          return (
            <Popover.Portal keepMounted>
              <Popover.Positioner
                side="top"
                sideOffset={10}
                align={getPreviewAlign(activeLink)}
                className={footerMorphingPreviewPositionerClassName}
                onMouseEnter={handlePreviewEnter}
                onMouseLeave={scheduleClose}
              >
                <Popover.Popup
                  data-bare={isBare || undefined}
                  className={footerPreviewPopupClassName}
                  onMouseEnter={handlePreviewEnter}
                  onMouseLeave={scheduleClose}
                >
                  {payload !== undefined && (
                    <Popover.Viewport className={footerPreviewViewportSwipeClassName}>
                      <LinkPreviewPanel href={payload.href} />
                    </Popover.Viewport>
                  )}
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          );
        }}
      </Popover.Root>
    </footer>
  );
}
