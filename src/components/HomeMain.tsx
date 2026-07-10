"use client";

import dynamic from "next/dynamic";
import { HomeIntro } from "@/components/HomeIntro";
import { StaggerBlock, StaggerGroup } from "@/components/motion/Stagger";
import {
  charStaggerBy,
  charStaggerStartDelay,
  revealStaggerBy,
  revealStaggerStartDelay,
} from "@/lib/motion";

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
    <div className="space-y-4 text-left leading-relaxed tracking-tighter">
      <StaggerGroup
        variant="textReveal"
        staggerBy={charStaggerBy}
        startDelay={charStaggerStartDelay}
      >
        <HomeIntro />
      </StaggerGroup>

      <StaggerGroup
        variant="textReveal"
        staggerBy={revealStaggerBy}
        startDelay={revealStaggerStartDelay}
      >
        <StaggerBlock className="!mt-10">
          <SpotifyWidget />
        </StaggerBlock>
        <StaggerBlock className="mb-4 flex flex-col items-center">
          <VisitorGlobe />
        </StaggerBlock>
      </StaggerGroup>
    </div>
  );
}
