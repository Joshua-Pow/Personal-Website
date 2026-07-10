"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { HomeIntro } from "@/components/HomeIntro";
import { StaggerBlock, StaggerGroup } from "@/components/motion/Stagger";
import { useStaggerGranularity } from "@/hooks/useStaggerGranularity";
import { revealStaggerBy, revealStaggerStartDelay } from "@/lib/motion";

const SpotifyWidget = dynamic(() => import("@/components/SpotifyWidget"), {
  ssr: false,
});
const VisitorGlobe = dynamic(() => import("@/components/VisitorGlobe"), {
  ssr: false,
  loading: () => (
    <div
      className="mb-8 flex h-[300px] w-[300px] items-center justify-center"
      aria-hidden
    />
  ),
});

const MOBILE_WIDGET_DELAY_MS = 1200;

export function HomeMain() {
  const granularity = useStaggerGranularity();
  const isCharMode = granularity === "char";
  const [mobileWidgetsReady, setMobileWidgetsReady] = useState(false);
  const widgetsReady = isCharMode || mobileWidgetsReady;

  useEffect(() => {
    if (isCharMode) {
      return;
    }

    const timeout = window.setTimeout(
      () => setMobileWidgetsReady(true),
      MOBILE_WIDGET_DELAY_MS
    );

    return () => window.clearTimeout(timeout);
  }, [isCharMode]);

  return (
    <div className="space-y-4 text-left leading-relaxed tracking-tighter">
      <StaggerGroup adaptive>
        <HomeIntro />
      </StaggerGroup>

      {widgetsReady ? (
        <StaggerGroup
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
      ) : (
        <div className="!mt-10 mb-4" aria-hidden>
          <div className="h-[120px]" />
          <div className="mx-auto h-[300px] w-[300px]" />
        </div>
      )}
    </div>
  );
}
