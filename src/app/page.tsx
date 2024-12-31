import AnimatedTime from "@/components/AnimatedTime";
import SpotifyWidget from "@/components/SpotifyWidget";
export default function Home() {
  return (
    <div className="flex h-full flex-col px-4">
      <NameTransition />
      <div className="my-auto flex flex-col gap-4">
        <div className="text-center leading-relaxed tracking-tighter">
          <p>
            Hi, my name is <span className="font-medium">Joshua Pow</span>
          </p>
          <p>
            I&apos;m a computer engineer from the{" "}
            <span className="text-nowrap font-medium">
              University of Toronto
            </span>
          </p>
          <span className="flex flex-row flex-wrap justify-center gap-2 py-1">
            <span className="flex h-8 items-center text-nowrap">
              I graduated
            </span>
            <AnimatedTime graduationDate={new Date("2024-06-18 11:00:00")} />
            <span className="flex h-8 items-center text-nowrap">ago.</span>
          </span>
        </div>

        <SpotifyWidget />
      </div>

      {/* <Link href="/history">History</Link> */}
    </div>
  );
}

function NameTransition() {
  return (
    <h1 className="transition-element mb-8 self-start pt-6 font-medium sm:pt-12">
      <span className="sr-only">Joshua Pow</span>
      <span aria-hidden="true" className="group relative block overflow-hidden">
        <span className="inline-block transition-all duration-300 ease-in-out group-hover:-translate-y-full">
          {"Joshua Pow".split("").map((letter, index) => (
            <span
              key={index}
              className="inline-block"
              style={{ transitionDelay: `${index * 25}ms` }}
            >
              {letter === " " ? "\u00A0" : letter}
            </span>
          ))}
        </span>
        <span className="absolute left-0 top-0 inline-block translate-y-full transition-all duration-300 ease-in-out group-hover:translate-y-0">
          {"joshpow".split("").map((letter, index) => (
            <span
              key={index}
              className="inline-block"
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
