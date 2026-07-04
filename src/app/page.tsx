import { SiteHeader } from "@/components/SiteHeader";
import { HomeIntro } from "@/components/HomeIntro";
import { HomePageWidgets } from "@/components/HomePageWidgets";

export default function Home() {
  return (
    <div className="flex flex-grow flex-col px-8">
      <SiteHeader />
      <div className="my-auto flex flex-col gap-10">
        <HomeIntro />
        <HomePageWidgets />
      </div>
    </div>
  );
}
