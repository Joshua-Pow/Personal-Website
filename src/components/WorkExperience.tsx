import React from "react";

import { textRevealStaggerMs } from "@/lib/motion";

import { LanguageBadge } from "./LanguageBadge";
import type { Logos } from "./Logos";
import { RevealOnScroll } from "./motion/RevealOnScroll";

interface WorkExperienceProps {
  index: number;
  company: string;
  jobTitle: string;
  period: string;
  description: React.ReactNode | React.ReactNode[];
  technologies?: {
    logo: keyof typeof Logos;
    name: string;
  }[];
}

function AnimatedParagraphs({
  children,
  baseDelay,
}: {
  children: React.ReactNode | React.ReactNode[];
  baseDelay: number;
}) {
  const childrenArray = Array.isArray(children) ? children : [children];

  return (
    <>
      {childrenArray.map((child, pIndex) => (
        <RevealOnScroll
          key={pIndex}
          variant="fadeUpSm"
          delay={baseDelay + textRevealStaggerMs + pIndex * textRevealStaggerMs}
        >
          {child}
        </RevealOnScroll>
      ))}
    </>
  );
}

export function WorkExperience({
  index,
  company,
  jobTitle,
  period,
  description,
  technologies,
}: WorkExperienceProps) {
  const baseDelay = Math.min(index - 1, 5) * 40;

  return (
    <RevealOnScroll variant="blurUp" delay={baseDelay} className="mb-8">
      <h2 className="text-base font-medium text-balance">{company}</h2>
      <p className="mb-3 text-sm text-subtle">
        {jobTitle}
        <span aria-hidden="true"> | </span>
        {period}
      </p>
      <div className="leading-7 hyphens-auto">
        <AnimatedParagraphs baseDelay={baseDelay}>
          {description}
        </AnimatedParagraphs>
      </div>
      {technologies && technologies.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <LanguageBadge key={tech.name} logo={tech.logo} name={tech.name} />
          ))}
        </div>
      )}
    </RevealOnScroll>
  );
}
