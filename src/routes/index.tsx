import { createFileRoute } from "@tanstack/react-router";

import { HomeIntro } from "@/components/HomeIntro";
import { HomePageWidgets } from "@/components/HomePageWidgets";
import { SiteHeader } from "@/components/SiteHeader";
import { buildPageHead } from "@/lib/seo";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site-metadata";

export const Route = createFileRoute("/")({
  head: () => ({
    ...buildPageHead({ path: "/" }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(personJsonLd),
      },
    ],
  }),
  component: Home,
});

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE_NAME,
  url: SITE_URL,
  image: `${SITE_URL}/icon.png`,
  description: SITE_DESCRIPTION,
  jobTitle: "Computer Engineer",
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "University of Toronto",
  },
  worksFor: {
    "@type": "Organization",
    name: "Nuclear Promise X",
    url: "https://www.npxinnovation.ca/",
  },
};

function Home() {
  return (
    <div className="flex grow flex-col px-8">
      <SiteHeader />
      <div className="my-auto flex flex-col gap-10">
        <HomeIntro />
        <HomePageWidgets />
      </div>
    </div>
  );
}
