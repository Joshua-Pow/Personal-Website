import SpotifyWidget from "@/components/SpotifyWidget";
import VisitorGlobe from "@/components/VisitorGlobe";
import { SiteHeader } from "@/components/SiteHeader";
import { HomeIntro } from "@/components/HomeIntro";
import { Reveal } from "@/components/motion/Reveal";

export default function Home() {
  return (
    <div className="flex flex-grow flex-col px-8">
      <SiteHeader />
      <div className="my-auto flex flex-col gap-10">
        <HomeIntro />

        <Reveal variant="focusIn" delay={200}>
          <SpotifyWidget />
        </Reveal>
        <Reveal variant="focusIn" delay={250} className="mb-4 flex flex-col items-center">
          <VisitorGlobe />
        </Reveal>
      </div>
    </div>
  );
}
