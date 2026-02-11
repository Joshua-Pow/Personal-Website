import { Logos } from "./Logos";

interface LanguageBadgeProps {
  logo: keyof typeof Logos;
  name: string;
}

export function LanguageBadge({ logo, name }: LanguageBadgeProps) {
  const LogoComponent = Logos[logo];

  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-white/50 px-2.5 py-0.5 text-xs font-semibold shadow-sm transition-all duration-200 ease-out hover:bg-white/80 active:scale-[0.98]">
      <LogoComponent className="h-4 w-4" />
      <span className="opacity-50">{name}</span>
    </div>
  );
}
