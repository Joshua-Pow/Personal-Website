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
    <div className="flex h-full flex-col px-8 pt-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-subtle">
            Lab
          </p>
          <h1 className="font-instrument text-3xl tracking-tight text-on-surface">
            sfx
          </h1>
          <p className="mt-2 max-w-prose text-sm text-on-surface-muted">
            Browse built-in interaction sounds, tweak recipes live, and save
            drafts locally. Copy a TypeScript snippet into{" "}
            <code>src/lib/sfx/sounds/recipes.ts</code> to ship a new builtin.
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
