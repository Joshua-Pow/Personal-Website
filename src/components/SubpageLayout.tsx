import { AnimatedName } from "@/components/AnimatedName";
import { SubpageTitle } from "@/components/SubpageTitle";
import { Reveal } from "@/components/motion/Reveal";

type SubpageLayoutProps = {
  title: string;
  intro: React.ReactNode;
  children: React.ReactNode;
};

export function SubpageLayout({ title, intro, children }: SubpageLayoutProps) {
  return (
    <div className="flex h-full flex-col px-8">
      <SubpageTitle>{title}</SubpageTitle>
      <AnimatedName />
      <Reveal variant="blurIn" className="mb-8">
        {intro}
      </Reveal>
      {children}
    </div>
  );
}
