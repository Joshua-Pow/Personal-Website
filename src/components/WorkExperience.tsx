import { Logos } from "./Logos";
import { LanguageBadge } from "./LanguageBadge";

interface WorkExperienceProps {
  index: number;
  company: string;
  role: string;
  period: string;
  description: React.ReactNode;
  technologies?: Array<{
    logo: keyof typeof Logos;
    name: string;
  }>;
}

export function WorkExperience({
  index,
  company,
  role,
  period,
  description,
  technologies,
}: WorkExperienceProps) {
  return (
    <div
      className={`motion-delay-[${index * 200}ms] motion-preset-slide-up mb-8`}
    >
      <h2 className="text-base font-medium">{company}</h2>
      <p className="mb-3 text-sm opacity-40">
        {role} | {period}
      </p>
      <span className="max-w-[25em] hyphens-auto leading-7">{description}</span>
      {technologies && technologies.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <LanguageBadge key={tech.name} logo={tech.logo} name={tech.name} />
          ))}
        </div>
      )}
    </div>
  );
}
