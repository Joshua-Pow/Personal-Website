import { Link } from "next-view-transitions";
import AnimatedTime from "./components/AnimatedTime";

export default function Home() {
  return (
    <div>
      <NameTransition />
      <div className="text-center">
        <p>
          Hi my name is <span className="font-bold">Joshua Pow</span>
        </p>
        <p>
          I am a compuer engineer from the{" "}
          <span className="font-bold">University of Toronto</span>
        </p>
        <span className="flex items-start justify-center gap-2 py-1">
          <span className="flex h-8 items-center">I graduated</span>
          <AnimatedTime graduationDate={new Date("2024-06-18 11:00:00")} />
          <span className="flex h-8 items-center">ago.</span>
        </span>
      </div>

      {/* <Link href="/history">History</Link> */}
    </div>
  );
}

function NameTransition() {
  return (
    <h1 className="transition-element mb-8 pt-12 font-medium">
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
