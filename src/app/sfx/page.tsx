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
    <div className="sfx-lab mx-auto w-full px-8 pb-8 pt-6 md:relative md:left-1/2 md:w-[min(100vw-2rem,48rem)] md:-translate-x-1/2 md:px-8 md:pt-8">
      <section
        className="sfx-lab-portal"
        aria-labelledby="sfx-lab-title"
      >
        <header className="sfx-lab-portal-header px-5 pb-5 pt-5 sm:px-6 sm:pt-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="sfx-lab-kicker text-[11px] font-medium uppercase">
                Studio
              </p>
              <h1
                id="sfx-lab-title"
                className="sfx-lab-title font-instrument text-3xl tracking-tight sm:text-4xl"
              >
                sfx
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 pt-0.5 sm:gap-2 sm:pt-1">
              <TickSoundToggle />
              <SharedPowName variant="back-link" color="var(--sfx-ink)" />
            </div>
          </div>
          <div className="sfx-lab-path mt-3 max-w-[12rem]" aria-hidden />
          <p className="sfx-lab-lede mt-3 max-w-prose text-sm leading-relaxed">
            A small sound atelier — pick a voice on the left, paint layers on
            the right. Preview stays within reach while you work.
          </p>
        </header>

        <div className="px-4 pb-5 pt-4 sm:px-6 sm:pb-6">
          <SfxDashboard />
        </div>
      </section>
    </div>
  );
}
