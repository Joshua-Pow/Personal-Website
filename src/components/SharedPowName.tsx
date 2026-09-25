import { Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";

import { durations, nameLetterStagger } from "@/lib/motion";
import { DISPLAY_NAME, NAME_COLORS } from "@/lib/shared-name";

const HOVER_NAME = "joshpow";

const displayLetters = [...DISPLAY_NAME];
const hoverLetters = [...HOVER_NAME];
const letterDurationMs = durations.nameLetter * 1000;
const letterStaggerMs = nameLetterStagger * 1000;

function letterDelays(index: number, count: number) {
  return {
    forward: index * letterStaggerMs,
    reverse: (count - 1 - index) * letterStaggerMs,
  };
}

function letterStyle(delays: {
  forward: number;
  reverse: number;
}): CSSProperties {
  // SAFETY: CSS custom properties are valid inline styles; CSSProperties does
  // not declare `--delay-*` keys in this TypeScript DOM lib.
  return {
    transitionDuration: `${letterDurationMs}ms`,
    "--delay-forward": `${delays.forward}ms`,
    "--delay-reverse": `${delays.reverse}ms`,
  } as CSSProperties;
}

function PowNameLabel({ color }: { color: string }) {
  return (
    <span
      className="vt-pow inline-block font-medium whitespace-nowrap"
      style={{ color }}
    >
      {DISPLAY_NAME}
    </span>
  );
}

function LetterScrollName() {
  return (
    <>
      <span className="inline-block" aria-hidden="true">
        {displayLetters.map((letter, index) => {
          const delays = letterDelays(index, displayLetters.length);

          return (
            <span
              key={`display-${index}`}
              className="inline-block transition-transform [transition-delay:var(--delay-reverse)] ease-out group-hover:-translate-y-full group-hover:[transition-delay:var(--delay-forward)] motion-reduce:transition-none"
              style={letterStyle(delays)}
            >
              {letter === " " ? "\u00A0" : letter}
            </span>
          );
        })}
      </span>
      <span className="absolute top-0 left-0 inline-block" aria-hidden="true">
        {hoverLetters.map((letter, index) => {
          const delays = letterDelays(index, hoverLetters.length);

          return (
            <span
              key={`hover-${index}`}
              className="inline-block translate-y-full transition-transform [transition-delay:var(--delay-reverse)] ease-out group-hover:translate-y-0 group-hover:[transition-delay:var(--delay-forward)] motion-reduce:transition-none"
              style={letterStyle(delays)}
            >
              {letter}
            </span>
          );
        })}
      </span>
    </>
  );
}

function HeaderName() {
  return (
    <>
      <span className="sr-only">{DISPLAY_NAME}</span>
      <span
        className="vt-pow group relative inline-block overflow-hidden font-medium whitespace-nowrap"
        style={{ color: NAME_COLORS.header }}
        data-sfx-hover="sparkle"
      >
        <LetterScrollName />
      </span>
    </>
  );
}

function BackLinkName({ color }: { color?: string }) {
  return (
    <Link
      to="/"
      className="inline-block rounded-sm"
      data-sfx-hover="tick"
      data-sfx-press
      data-sfx-release
    >
      <PowNameLabel color={color ?? NAME_COLORS.backLink} />
    </Link>
  );
}

interface SharedPowNameProps {
  variant: "header" | "back-link";
  /** Override label color (back-link only). Useful on tinted surfaces. */
  color?: string;
}

export function SharedPowName({ variant, color }: SharedPowNameProps) {
  return variant === "header" ? <HeaderName /> : <BackLinkName color={color} />;
}
