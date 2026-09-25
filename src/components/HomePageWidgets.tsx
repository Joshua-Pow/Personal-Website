import { Reveal } from "@/components/motion/Reveal";
import SpotifyWidget from "@/components/SpotifyWidget";
import VisitorGlobe from "@/components/VisitorGlobe";
import { enterDelays } from "@/lib/motion";

export function HomePageWidgets() {
  return (
    <>
      <Reveal variant="focusIn" delay={enterDelays.secondary}>
        <SpotifyWidget />
      </Reveal>
      <Reveal
        variant="focusIn"
        delay={enterDelays.tertiary}
        className="mb-4 flex flex-col items-center"
      >
        <VisitorGlobe />
      </Reveal>
    </>
  );
}
