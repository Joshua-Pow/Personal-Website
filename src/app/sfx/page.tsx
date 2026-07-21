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
    <div className="relative left-1/2 w-screen max-w-[64rem] -translate-x-1/2 px-4 pb-8 pt-6 sm:px-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-subtle">
            Lab
          </p>
          <h1 className="font-instrument text-3xl tracking-tight text-on-surface">
            sfx
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-on-surface-muted">
            Pick a sound on the left, tweak layers on the right. Play stays
            sticky while you edit.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <TickSoundToggle />
          <SharedPowName variant="back-link" />
        </div>
      </div>
      <SfxDashboard />
    </div>
  );
}
