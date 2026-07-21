import type { Metadata } from "next";
import { SharedPowName } from "@/components/SharedPowName";
import { TickSoundToggle } from "@/components/TickSoundToggle";
import { SfxDashboard } from "@/components/sfx/SfxDashboard";

export const metadata: Metadata = {
  title: "sfx",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/sfx",
  },
};

export default function SfxPage() {
  return (
    <div className="sfx-lab relative left-1/2 w-[min(100vw,48rem)] -translate-x-1/2 px-8 pb-14 pt-8">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="sfx-lab-kicker text-[11px] font-medium uppercase">
            Studio
          </p>
          <h1 className="sfx-lab-title font-instrument text-4xl tracking-tight">
            sfx
          </h1>
          <div className="sfx-lab-path mt-3 max-w-[12rem]" aria-hidden />
          <p className="sfx-lab-lede mt-3 max-w-prose text-sm leading-relaxed">
            A small sound atelier — pick a voice on the left, paint layers on
            the right. Preview stays within reach while you work.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-1">
          <TickSoundToggle />
          <SharedPowName variant="back-link" />
        </div>
      </div>
      <SfxDashboard />
    </div>
  );
}
