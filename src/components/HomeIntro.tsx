import { Link } from "next-view-transitions";
import AnimatedTime from "@/components/AnimatedTime";
import { Reveal } from "@/components/motion/Reveal";
import { MotionLink } from "@/components/motion/MotionLink";

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
    </div>
  );
}
