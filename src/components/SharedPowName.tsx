import { Link } from "next-view-transitions";
import { durations, nameLetterStagger } from "@/lib/motion";
import {
  DISPLAY_NAME,
  NAME_COLORS,
} from "@/lib/shared-name";

const HOVER_NAME = "joshpow";

const displayLetters = DISPLAY_NAME.split("");
const hoverLetters = HOVER_NAME.split("");
const letterDurationMs = durations.nameLetter * 1000;
const letterStaggerMs = nameLetterStagger * 1000;

function letterDelays(index: number, count: number) {
  return {
    forward: index * letterStaggerMs,
    reverse: (count - 1 - index) * letterStaggerMs,
  };
}

function PowNameLabel({ color }: { color: string }) {
  return (
    <span
      className="vt-pow inline-block whitespace-nowrap font-medium"
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
              className="inline-block transition-transform ease-out [transition-delay:var(--delay-reverse)] group-hover:-translate-y-full group-hover:[transition-delay:var(--delay-forward)]"
              style={
                {
                  transitionDuration: `${letterDurationMs}ms`,
                  "--delay-forward": `${delays.forward}ms`,
                  "--delay-reverse": `${delays.reverse}ms`,
                } as React.CSSProperties
              }
            >
              {letter === " " ? "\u00A0" : letter}
            </span>
          );
        })}
      </span>
      <span className="absolute left-0 top-0 inline-block" aria-hidden="true">
        {hoverLetters.map((letter, index) => {
          const delays = letterDelays(index, hoverLetters.length);

          return (
            <span
              key={`hover-${index}`}
              className="inline-block translate-y-full transition-transform ease-out [transition-delay:var(--delay-reverse)] group-hover:translate-y-0 group-hover:[transition-delay:var(--delay-forward)]"
              style={
                {
                  transitionDuration: `${letterDurationMs}ms`,
                  "--delay-forward": `${delays.forward}ms`,
                  "--delay-reverse": `${delays.reverse}ms`,
                } as React.CSSProperties
              }
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
        className="vt-pow group relative inline-block overflow-hidden whitespace-nowrap font-medium"
        style={{ color: NAME_COLORS.header }}
      >
        <LetterScrollName />
      </span>
    </>
  );
}

function BackLinkName() {
  return (
    <Link href="/" className="inline-block">
      <PowNameLabel color={NAME_COLORS.backLink} />
    </Link>
  );
}

type SharedPowNameProps = {
  variant: "header" | "back-link";
};

export function SharedPowName({ variant }: SharedPowNameProps) {
  return variant === "header" ? <HeaderName /> : <BackLinkName />;
}
