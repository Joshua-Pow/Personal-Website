import { SharedPowName } from "@/components/SharedPowName";
import { TickSoundToggle } from "@/components/TickSoundToggle";

export function AnimatedName() {
  return (
    <div className="mb-8 flex items-center justify-between gap-4">
      <SharedPowName variant="back-link" />
      <TickSoundToggle />
    </div>
  );
}
