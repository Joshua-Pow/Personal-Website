"use client";

import { Link } from "next-view-transitions";
import AnimatedTime from "@/components/AnimatedTime";
import { MotionLink } from "@/components/motion/MotionLink";
import { StaggerSentence } from "@/components/motion/StaggerText";
import { WordPopover } from "@/components/WordPopover";
import { interactiveLink } from "@/lib/interactive";
import { cn } from "@/lib/utils/cn";

const tapLinkClassName = cn(
  interactiveLink(),
  "inline-block transition-transform duration-150 ease-out active:scale-[0.98] motion-reduce:transition-none"
);

export function HomeIntro() {
  return (
    <>
      <p className="text-pretty">
        <StaggerSentence>
          Hi, I&apos;m <span className="font-medium">Joshua Pow</span>.
        </StaggerSentence>
      </p>

      <p className="text-pretty">
        <StaggerSentence>
          I&apos;m a computer engineer from the{" "}
          <span className="text-nowrap font-medium">University of Toronto </span>
          and an aspiring{" "}
          <span className="text-nowrap font-medium">Design Engineer</span>.
        </StaggerSentence>
      </p>

      <p className="text-pretty">
        <StaggerSentence>
          I graduated <AnimatedTime graduationDate={new Date("2024-06-18 11:00:00")} />{" "}
          ago.
        </StaggerSentence>
      </p>

      <p className="text-pretty">
        <StaggerSentence>
          Since then, I&apos;ve been{" "}
          <Link href="/history" className={tapLinkClassName}>
            working
          </Link>{" "}
          at{" "}
          <MotionLink
            href="https://www.npxinnovation.ca/"
            className="text-nowrap"
          >
            Nuclear Promise X
          </MotionLink>
          , a nuclear innovation company, helping to modernize the industry one{" "}
          <code className="rounded px-1 py-0.5 shadow-sm">
            {"<div/>"}
          </code>{" "}
          at a time.
        </StaggerSentence>
      </p>

      <p className="text-pretty">
        <StaggerSentence>
          Off the clock, I pursue a mild recreational{" "}
          <WordPopover
            term="technophilia"
            definition="A fondness for experimenting with new technology, often for the sheer pleasure of it."
          />
          , tinkering with AI tooling, stress-testing{" "}
          <WordPopover
            term="frontier LLMs"
            definition="The newest large language models at the leading edge of what’s shipping."
          />
          , and reading{" "}
          <WordPopover
            term="voraciously"
            definition="With an eager, almost insatiable appetite for books."
          />{" "}
          across self-improvement and software craft.{" "}
        </StaggerSentence>
        <StaggerSentence>
          The{" "}
          <WordPopover
            term="aphorisms"
            definition="Short, memorable statements of truth or wisdom, often passed down rather than authored."
          />{" "}
          that survive scrutiny end up in my{" "}
          <Link href="/adages" className={tapLinkClassName}>
            adages
          </Link>
          .
        </StaggerSentence>
      </p>
    </>
  );
}
