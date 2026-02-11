"use client";

import React from "react";
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
  // Normalize to array
  const childrenArray = Array.isArray(children) ? children : [children];

  return (
    <>
      {childrenArray.map((child, pIndex) => (
        <div
          key={pIndex}
          className="intersect-once intersect:motion-translate-y-in-2 motion-safe:intersect:motion-translate-y-in-2 intersect:motion-opacity-in-0 intersect:motion-duration-150 intersect:motion-ease-out motion-safe:intersect:motion-opacity-in-0"
          style={
            {
              "--motion-delay": `${baseDelay + 140 + pIndex * 40}ms`,
            } as React.CSSProperties
          }
        >
          {child}
        </div>
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
  const baseDelay = (index - 1) * 30; // Short stagger

  return (
    <div
      className="intersect-once intersect:motion-translate-y-in-4 motion-safe:intersect:motion-translate-y-in-4 mb-8 intersect:motion-blur-in-md intersect:motion-opacity-in-0 intersect:motion-duration-200 intersect:motion-ease-out motion-safe:intersect:motion-blur-in-md motion-safe:intersect:motion-opacity-in-0"
      style={{ "--motion-delay": `${baseDelay}ms` } as React.CSSProperties}
    >
      <h2
        className="intersect-once intersect:motion-translate-y-in-2 motion-safe:intersect:motion-translate-y-in-2 text-base font-medium intersect:motion-opacity-in-0 intersect:motion-duration-150 intersect:motion-ease-out motion-safe:intersect:motion-opacity-in-0"
        style={
          { "--motion-delay": `${baseDelay + 60}ms` } as React.CSSProperties
        }
      >
        {company}
      </h2>
      <p
        className="intersect-once intersect:motion-translate-y-in-2 motion-safe:intersect:motion-translate-y-in-2 mb-3 text-sm opacity-40 intersect:motion-opacity-in-0 intersect:motion-duration-150 intersect:motion-ease-out motion-safe:intersect:motion-opacity-in-0"
        style={
          { "--motion-delay": `${baseDelay + 100}ms` } as React.CSSProperties
        }
      >
        {role} | {period}
      </p>
      <div className="hyphens-auto leading-7">
        <AnimatedParagraphs baseDelay={baseDelay}>
          {description}
        </AnimatedParagraphs>
      </div>
      {technologies && technologies.length > 0 && (
        <div
          className="intersect-once intersect:motion-translate-y-in-2 motion-safe:intersect:motion-translate-y-in-2 mt-4 flex flex-wrap gap-2 intersect:motion-opacity-in-0 intersect:motion-duration-150 intersect:motion-ease-out motion-safe:intersect:motion-opacity-in-0"
          style={
            { "--motion-delay": `${baseDelay + 180}ms` } as React.CSSProperties
          }
        >
          {technologies.map((tech, techIndex) => (
            <div
              key={tech.name}
              className="intersect-once intersect:motion-translate-y-in-2 motion-safe:intersect:motion-translate-y-in-2 intersect:motion-opacity-in-0 intersect:motion-duration-150 intersect:motion-ease-out motion-safe:intersect:motion-opacity-in-0"
              style={
                {
                  "--motion-delay": `${baseDelay + 100 + techIndex * 50}ms`,
                } as React.CSSProperties
              }
            >
              <LanguageBadge logo={tech.logo} name={tech.name} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
