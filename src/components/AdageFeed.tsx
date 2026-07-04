import { AdageCard } from "@/components/AdageCard";
import { getAdages } from "@/lib/adages";

export async function AdageFeed() {
  const adages = await getAdages();

  return (
    <div className="flex flex-col gap-16 pb-24">
      {adages.map((adage, index) => (
        <AdageCard key={adage.slug} adage={adage} index={index} />
      ))}
    </div>
  );
}
