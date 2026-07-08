import { Link } from "next-view-transitions";
import AnimatedTime from "@/components/AnimatedTime";
import { LocationMapPopover } from "@/components/LocationMapPopover";
import { PronunciationPopover } from "@/components/PronunciationPopover";
import { RevealStagger } from "@/components/motion/RevealStagger";
import { MotionLink } from "@/components/motion/MotionLink";
import { WordPopover } from "@/components/WordPopover";
import { interactiveLink } from "@/lib/interactive";
import { cn } from "@/lib/utils/cn";

const tapLinkClassName = cn(
  interactiveLink(),
  "inline-block transition-transform duration-150 ease-out active:scale-[0.98] motion-reduce:transition-none"
);

export function HomeIntro() {
  return (
    <div className="space-y-4 text-left leading-relaxed tracking-tighter">
      <p className="text-pretty">
        Hi, I&apos;m <span className="font-medium">Joshua Pow</span>.
      </p>

      <p className="max-w-[38ch] text-pretty font-instrument text-[1.0625rem] leading-[1.55] tracking-[0.01em] text-on-surface sm:text-lg">
        I&apos;m{" "}
        <PronunciationPopover
          term="Anishinaabe"
          pronunciation="uh-nish-ih-NAH-bay"
          meaning="A member of the Anishinaabe nations — the Ojibwe, Odawa, and Algonquin peoples of the Great Lakes."
        />
        , from{" "}
        <PronunciationPopover
          term="Kitigan Zibi Anishinabeg"
          pronunciation="kih-TIH-gun ZEE-bee uh-nish-ih-NAH-beg"
          meaning='A First Nation community on the Gatineau River in Quebec — Kitigan Zibi means "Garden River" in Algonquin.'
        />
        , though I live in{" "}
        <LocationMapPopover>Toronto</LocationMapPopover> these days.
      </p>

      <RevealStagger className="space-y-4">
        <p className="text-pretty">
          I&apos;m a computer engineer from the{" "}
          <span className="text-nowrap font-medium">University of Toronto </span>
          and an aspiring{" "}
          <span className="text-nowrap font-medium">Design Engineer</span>.
        </p>

        <p className="flex flex-row flex-wrap justify-start gap-1 text-pretty">
          <span className="flex h-6 items-center text-nowrap sm:h-8">
            I graduated
          </span>
          <AnimatedTime graduationDate={new Date("2024-06-18 11:00:00")} />
          <span className="flex h-6 items-center text-nowrap sm:h-8">ago.</span>
        </p>

        <p className="text-pretty">
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
        </p>

        <p className="text-pretty">
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
          <Link href="/adages" className={tapLinkClassName}>
            adages
          </Link>
          .
        </p>
      </RevealStagger>
    </div>
  );
}
