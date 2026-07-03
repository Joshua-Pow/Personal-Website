"use client";

import React from "react";
import { RevealOnScroll } from "./motion/RevealOnScroll";
import { Logos } from "./Logos";
import { LanguageBadge } from "./LanguageBadge";

interface WorkExperienceProps {
  index: number;
  company: string;
  role: string;
  period: string;
  description: React.ReactNode | React.ReactNode[];
  technologies?: Array<{
    logo: keyof typeof Logos;
    name: string;
  }>;
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
          delay={baseDelay + 140 + pIndex * 40}
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
  role,
  period,
  description,
  technologies,
}: WorkExperienceProps) {
  const baseDelay = (index - 1) * 30;

  return (
    <RevealOnScroll variant="blurUp" delay={baseDelay} className="mb-8">
      <RevealOnScroll variant="fadeUpSm" delay={baseDelay + 60} as="h2" className="text-base font-medium">
        {company}
      </RevealOnScroll>
      <RevealOnScroll
        variant="fadeUpSm"
        delay={baseDelay + 100}
        as="p"
        className="mb-3 text-sm opacity-40"
      >
        {role} | {period}
      </RevealOnScroll>
      <div className="hyphens-auto leading-7">
        <AnimatedParagraphs baseDelay={baseDelay}>
          {description}
        </AnimatedParagraphs>
      </div>
      {technologies && technologies.length > 0 && (
        <RevealOnScroll
          variant="fadeUpSm"
          delay={baseDelay + 180}
          className="mt-4 flex flex-wrap gap-2"
        >
          {technologies.map((tech, techIndex) => (
            <RevealOnScroll
              key={tech.name}
              variant="fadeUpSm"
              delay={baseDelay + 100 + techIndex * 50}
            >
              <LanguageBadge logo={tech.logo} name={tech.name} />
            </RevealOnScroll>
          ))}
        </RevealOnScroll>
      )}
    </RevealOnScroll>
  );
}
