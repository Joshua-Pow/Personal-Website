"use client";

import React from "react";
import { RevealOnScroll } from "./motion/RevealOnScroll";
import { Logos } from "./Logos";
import { LanguageBadge } from "./LanguageBadge";
import { textRevealStaggerMs } from "@/lib/motion";

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
  role,
  period,
  description,
  technologies,
}: WorkExperienceProps) {
  const baseDelay = Math.min(index - 1, 5) * 40;

  return (
    <RevealOnScroll variant="blurUp" delay={baseDelay} className="mb-8">
      <h2 className="text-balance text-base font-medium">{company}</h2>
      <p className="mb-3 text-sm text-subtle">
        {role}
        <span aria-hidden="true"> | </span>
        {period}
      </p>
      <div className="hyphens-auto leading-7">
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
