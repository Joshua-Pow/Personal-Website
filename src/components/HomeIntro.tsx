import { Link } from "next-view-transitions";
import AnimatedTime from "@/components/AnimatedTime";
import { Reveal } from "@/components/motion/Reveal";
import { MotionLink } from "@/components/motion/MotionLink";
import { WordPopover } from "@/components/WordPopover";

export function HomeIntro() {
  return (
    <div className="space-y-4 text-left leading-relaxed tracking-tighter">
      <Reveal variant="fadeUp">
        <p>
          Hi, my name is <span className="font-medium">Joshua Pow</span>
        </p>
      </Reveal>

      <Reveal variant="fadeUp" delay={50}>
        <p>
          I&apos;m a computer engineer from the{" "}
          <span className="text-nowrap font-medium">University of Toronto </span>
          and an aspiring{" "}
          <span className="text-nowrap font-medium">Design Engineer</span>.
        </p>
      </Reveal>

      <Reveal variant="fadeUp" delay={100}>
        <p className="flex flex-row flex-wrap justify-start gap-1">
          <span className="flex h-6 items-center text-nowrap sm:h-8">
            I graduated
          </span>
          <AnimatedTime graduationDate={new Date("2024-06-18 11:00:00")} />
          <span className="flex h-6 items-center text-nowrap sm:h-8">ago.</span>
        </p>
      </Reveal>

      <Reveal variant="fadeUp" delay={150}>
        <p>
          Since then, I&apos;ve been{" "}
          <Link
            href="/history"
            className="font-medium text-orange-600 hover:text-orange-500"
          >
            working
          </Link>{" "}
          at{" "}
          <MotionLink
            href="https://www.npxinnovation.ca/"
            className="text-nowrap font-medium text-orange-600 hover:text-orange-500"
          >
            Nuclear Promise X
          </MotionLink>
          , a nuclear innovation company, helping to modernize the industry one{" "}
          <code className="rounded bg-slate-50/50 px-1 py-0.5 text-neutral-950 shadow-sm">
            {"<div/>"}
          </code>{" "}
          at a time.
        </p>
      </Reveal>

      <Reveal variant="fadeUp" delay={175}>
        <p>
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
          across self-improvement and software craft. The{" "}
          <WordPopover
            term="aphorisms"
            definition="Short, memorable statements of truth or wisdom, often passed down rather than authored."
          />{" "}
          that survive scrutiny end up in my{" "}
          <Link
            href="/adages"
            className="font-medium text-orange-600 hover:text-orange-500"
          >
            adages
          </Link>
          .
        </p>
      </Reveal>
    </div>
  );
}
