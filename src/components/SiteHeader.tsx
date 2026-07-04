import { SharedPowName } from "@/components/SharedPowName";
import { TickSoundToggle } from "@/components/TickSoundToggle";

export function SiteHeader() {
  return (
    <header className="mb-8 flex w-full items-start justify-between gap-4 self-start pt-6 sm:pt-12">
      <h1 className="min-w-0 font-medium">
        <SharedPowName variant="header" />
      </h1>
      <TickSoundToggle />
    </header>
  );
}
