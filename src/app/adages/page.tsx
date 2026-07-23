import { Suspense } from "react";
import { AdageFeed } from "@/components/AdageFeed";
import { SubpageLayout } from "@/components/SubpageLayout";

export const metadata = {
  title: "Adages",
  alternates: {
    canonical: "/adages",
  },
  openGraph: {
    url: "/adages",
  },
};

const page = () => {
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
      <Suspense fallback={null}>
        <AdageFeed />
      </Suspense>
    </SubpageLayout>
  );
};

export default page;
