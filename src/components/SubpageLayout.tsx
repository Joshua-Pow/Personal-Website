import { AnimatedName } from "@/components/AnimatedName";
import { SubpageIntro } from "@/components/SubpageIntro";
import { SubpageTitle } from "@/components/SubpageTitle";

interface SubpageLayoutProps {
  title: string;
  intro: React.ReactNode;
  children?: React.ReactNode;
}

export function SubpageLayout({ title, intro, children }: SubpageLayoutProps) {
  return (
    <div className="flex h-full flex-col px-8">
      <SubpageTitle>{title}</SubpageTitle>
      <AnimatedName />
      <SubpageIntro>{intro}</SubpageIntro>
      {children}
    </div>
  );
}
