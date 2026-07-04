"use client";

import dynamic from "next/dynamic";
import { Reveal } from "@/components/motion/Reveal";

const SpotifyWidget = dynamic(() => import("@/components/SpotifyWidget"));
const VisitorGlobe = dynamic(() => import("@/components/VisitorGlobe"), {
  loading: () => (
    <div
      className="mb-8 flex h-[300px] w-[300px] items-center justify-center"
      aria-hidden
    />
  ),
});

export function HomePageWidgets() {
  return (
    <>
      <Reveal variant="focusIn" delay={200}>
        <SpotifyWidget />
      </Reveal>
      <Reveal variant="focusIn" delay={250} className="mb-4 flex flex-col items-center">
        <VisitorGlobe />
      </Reveal>
    </>
  );
}
