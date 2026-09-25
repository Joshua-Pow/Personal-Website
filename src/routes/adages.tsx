import { createFileRoute } from "@tanstack/react-router";

import { AdageFeed } from "@/components/AdageFeed";
import { SubpageLayout } from "@/components/SubpageLayout";
import { getAdages } from "@/lib/adages";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/adages")({
  head: () => buildPageHead({ title: "Adages", path: "/adages" }),
  component: AdagesPage,
});

function AdagesPage() {
  const adages = getAdages();

  return (
    <SubpageLayout
      title="Adages"
      intro={
        <p>
          A collection of words worth keeping: short truths, borrowed wisdom,
          and lines that stuck.
        </p>
      }
    >
      <AdageFeed adages={adages} />
    </SubpageLayout>
  );
}
