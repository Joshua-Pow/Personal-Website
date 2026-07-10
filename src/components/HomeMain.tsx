"use client";

import dynamic from "next/dynamic";
import { HomeIntro } from "@/components/HomeIntro";
import { RevealStagger } from "@/components/motion/RevealStagger";

const SpotifyWidget = dynamic(() => import("@/components/SpotifyWidget"));
const VisitorGlobe = dynamic(() => import("@/components/VisitorGlobe"), {
  loading: () => (
    <div
      className="mb-8 flex h-[300px] w-[300px] items-center justify-center"
      aria-hidden
    />
  ),
});

export function HomeMain() {
  return (
    <RevealStagger className="space-y-4 text-left leading-relaxed tracking-tighter">
      <HomeIntro />
      <div className="!mt-10">
        <SpotifyWidget />
      </div>
      <div className="mb-4 flex flex-col items-center">
        <VisitorGlobe />
      </div>
    </RevealStagger>
  );
}
