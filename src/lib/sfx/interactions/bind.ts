/**
 * Declarative binding — one call to `bind()` wires up every element
 * carrying a `data-sfx-*` attribute:
 *
 *   data-sfx-hover    → plays on pointerenter (fine mouse, throttled)
 *   data-sfx-press    → plays on pointerdown
 *   data-sfx-release  → plays on pointerup
 *   data-sfx-toggle   → plays on click
 *
 * Adapted from Cuelume (MIT, Daniel Belyi). See ../NOTICE.
 */

import { play } from "../audio/engine";
import { isSoundName } from "../sounds/recipes";
import type { SoundName } from "../sounds/recipes";

const HOVER_GAP_MS = 150;
const boundRoots = new WeakSet<ParentNode>();
const handledEvents = new WeakSet<Event>();

let lastHoverTime = -Infinity;

function resolve(
  el: HTMLElement,
  attr: string,
  fallback: SoundName
): SoundName {
  const requested = el.getAttribute(attr);
  return isSoundName(requested) ? requested : fallback;
}

function isMouse(event: PointerEvent): boolean {
  return (
    event.pointerType === "mouse" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}

function findTarget(
  root: ParentNode,
  event: Event,
  attr: string
): HTMLElement | null {
  if (!(event.target instanceof Element)) {
    return null;
  }
  const element = event.target.closest(`[${attr}]`);
  if (!(element instanceof HTMLElement)) {
    return null;
  }
  if (!(root instanceof Node) || !root.contains(element)) {
    return null;
  }
  return element;
}

function listen(
  root: ParentNode,
  eventName: "pointerenter" | "pointerdown" | "pointerup" | "click",
  attr: string,
  fallback: SoundName,
  mouseOnly = false
): void {
  if (!(root instanceof EventTarget)) {
    return;
  }
  root.addEventListener(
    eventName,
    (event) => {
      const element = findTarget(root, event, attr);
      if (!element || handledEvents.has(event)) {
        return;
      }
      if (mouseOnly && (!(event instanceof PointerEvent) || !isMouse(event))) {
        return;
      }

      if (eventName === "pointerenter" && event instanceof PointerEvent) {
        const { relatedTarget } = event;
        if (relatedTarget instanceof Node && element.contains(relatedTarget)) {
          return;
        }

        const now = performance.now();
        if (now - lastHoverTime < HOVER_GAP_MS) {
          return;
        }
        lastHoverTime = now;
      }

      handledEvents.add(event);
      play(resolve(element, attr, fallback));
    },
    true
  );
}

/**
 * Delegates `data-sfx-*` interactions under `root` (default: the whole
 * document). Safe during SSR and safe to call repeatedly for the same root.
 */
export function bind(root?: ParentNode): void {
  if (typeof document === "undefined") {
    return;
  }
  const scope = root ?? document;
  if (boundRoots.has(scope)) {
    return;
  }
  boundRoots.add(scope);

  listen(scope, "pointerenter", "data-sfx-hover", "chime", true);
  listen(scope, "pointerdown", "data-sfx-press", "press");
  listen(scope, "pointerup", "data-sfx-release", "release");
  listen(scope, "click", "data-sfx-toggle", "toggle");
}
