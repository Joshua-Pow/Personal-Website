interface WorkExperienceProps {
  index: number;
  company: string;
  role: string;
  period: string;
  description: React.ReactNode;
}

export function WorkExperience({
  index,
  company,
  role,
  period,
  description,
}: WorkExperienceProps) {
  return (
    <div
      className={`motion-delay-[${index * 100}ms] motion-preset-slide-up mb-8`}
    >
      <h2 className="text-base font-medium text-gray-800">{company}</h2>
      <p className="mb-3 text-sm text-gray-400">
        {role} | {period}
      </p>
      <span className="max-w-[25em] hyphens-auto leading-7">{description}</span>
    </div>
  );
}
