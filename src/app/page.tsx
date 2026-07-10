import { SiteHeader } from "@/components/SiteHeader";
import { HomeMain } from "@/components/HomeMain";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site-metadata";

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE_NAME,
  url: SITE_URL,
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

export default function Home() {
  return (
    <div className="flex flex-grow flex-col px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <SiteHeader />
      <div className="my-auto">
        <HomeMain />
      </div>
    </div>
  );
}
