import { AnimatedName } from "@/components/AnimatedName";
import { AdageCard } from "@/components/AdageCard";
import { Reveal } from "@/components/motion/Reveal";
import { getAdages } from "@/lib/adages";

export const metadata = {
  title: "Adages",
  alternates: {
    canonical: "/adages",
  },
};

export default async function AdagesPage() {
  const adages = await getAdages();

  return (
    <div className="flex h-full flex-col px-8">
      <h1 className="pt-12 font-medium">Adages</h1>
      <AnimatedName />
      <Reveal variant="blurIn" className="mb-12">
        <p>
          A collection of words worth keeping — short truths, borrowed wisdom,
          and lines that stuck.
        </p>
      </Reveal>

      <div className="flex flex-col gap-16 pb-24">
        {adages.map((adage, index) => (
          <AdageCard key={adage.slug} adage={adage} index={index} />
        ))}
      </div>
    </div>
  );
}
