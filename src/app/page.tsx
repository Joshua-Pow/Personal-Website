import AnimatedTime from "@/components/AnimatedTime";
import SpotifyWidget from "@/components/SpotifyWidget";
import VisitorGlobe from "@/components/VisitorGlobe";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-grow flex-col px-8">
      <NameTransition />
      <div className="my-auto flex flex-col gap-10">
        <div className="space-y-4 text-left leading-relaxed tracking-tighter">
          <p
            className={`motion-translate-y-in-[20%] motion-opacity-in-[0%] motion-duration-[2000ms] motion-ease-out`}
          >
            Hi, my name is <span className="font-medium">Joshua Pow</span>
          </p>

          <p
            className={`motion-translate-y-in-[20%] motion-opacity-in-[0%] motion-duration-[2000ms] motion-delay-[200ms] motion-ease-out`}
          >
            I&apos;m a computer engineer from the{" "}
            <span className="text-nowrap font-medium">
              University of Toronto{" "}
            </span>
            and an aspiring{" "}
            <span className="text-nowrap font-medium">Design Engineer</span>.
          </p>

          <p
            className={`flex flex-row flex-wrap justify-start gap-1 motion-translate-y-in-[20%] motion-opacity-in-[0%] motion-duration-[2000ms] motion-delay-[600ms] motion-ease-out`}
          >
            <span className="flex h-6 items-center text-nowrap sm:h-8">
              I graduated
            </span>
            <AnimatedTime graduationDate={new Date("2024-06-18 11:00:00")} />
            <span className="flex h-6 items-center text-nowrap sm:h-8">
              ago.
            </span>
          </p>

          <p
            className={`motion-translate-y-in-[20%] motion-opacity-in-[0%] motion-duration-[2000ms] motion-delay-[800ms] motion-ease-out`}
          >
            Since then, I&apos;ve been{" "}
            <Link
              href="/history"
              className="font-medium text-orange-600 hover:text-orange-500"
            >
              working
            </Link>{" "}
            at{" "}
            <Link
              href="https://www.npxinnovation.ca/"
              className="text-nowrap font-medium text-orange-600 hover:text-orange-500"
            >
              Nuclear Promise X
            </Link>
            , a nuclear innovation company, helping to modernize the industry
            one{" "}
            <code className="rounded bg-slate-50/50 px-1 py-0.5 text-neutral-950 shadow-sm">
              {"<div/>"}
            </code>{" "}
            at a time.
          </p>
        </div>

        <div className="motion-preset-focus-lg motion-duration-700 motion-delay-[1600ms] motion-ease-out">
          <SpotifyWidget />
        </div>
        <div className="motion-preset-focus-lg mb-4 flex flex-col items-center motion-duration-700 motion-delay-[1600ms] motion-ease-out">
          <VisitorGlobe />
        </div>
      </div>
    </div>
  );
}

function NameTransition() {
  return (
    <h1 className="transition-element mb-8 w-full self-start pt-6 font-medium sm:pt-12">
      <span className="sr-only">Joshua Pow</span>
      <span aria-hidden="true" className="group relative block overflow-hidden">
        <span className="inline-block">
          {"Joshua Pow".split("").map((letter, index) => (
            <span
              key={index}
              className="inline-block transition-all duration-300 ease-in-out group-hover:-translate-y-full"
              style={{ transitionDelay: `${index * 25}ms` }}
            >
              {letter === " " ? "\u00A0" : letter}
            </span>
          ))}
        </span>
        <span className="absolute left-0 top-0">
          {"joshpow".split("").map((letter, index) => (
            <span
              key={index}
              className="inline-block translate-y-full transition-all duration-300 ease-in-out group-hover:translate-y-0"
              style={{ transitionDelay: `${index * 25}ms` }}
            >
              {letter}
            </span>
          ))}
        </span>
      </span>
    </h1>
  );
}
