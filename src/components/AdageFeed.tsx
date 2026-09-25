import { AdageCard } from "@/components/AdageCard";
import type { Adage } from "@/lib/adages";

export function AdageFeed({ adages }: { adages: Adage[] }) {
  return (
    <div className="flex flex-col gap-16 pb-24">
      {adages.map((adage, index) => (
        <AdageCard key={adage.slug} adage={adage} index={index} />
      ))}
    </div>
  );
}
