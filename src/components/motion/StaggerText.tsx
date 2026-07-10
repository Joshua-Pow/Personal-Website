"use client";

import AnimatedTime from "@/components/AnimatedTime";
import {
  useStaggerEntrance,
  useStaggerGranularityContext,
  useStaggerItem,
} from "@/components/motion/Stagger";
import { WordPopover } from "@/components/WordPopover";
import type { StaggerGranularity } from "@/hooks/useStaggerGranularity";
import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  useMemo,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils/cn";

function isAtomicElement(element: ReactElement): boolean {
  return element.type === WordPopover;
}

function staggerStyle(delay: number, duration: number): CSSProperties {
  return {
    "--stagger-delay": `${delay}s`,
    "--stagger-duration": `${duration}s`,
  } as CSSProperties;
}

function revealClass(reducedMotion: boolean) {
  return reducedMotion ? "stagger-reveal-reduced" : "stagger-reveal-soft";
}

function StaggerToken({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { delay, duration, reducedMotion } = useStaggerItem();

  return (
    <span
      className={cn("inline", revealClass(reducedMotion), className)}
      style={staggerStyle(delay, duration)}
    >
      {children}
    </span>
  );
}

function StaggerChar({ children }: { children: string }) {
  const { delay, duration, reducedMotion } = useStaggerItem();

  return (
    <span
      className={cn("inline", revealClass(reducedMotion))}
      style={staggerStyle(delay, duration)}
    >
      {children}
    </span>
  );
}

function StaggerAnimatedTime(
  props: React.ComponentProps<typeof AnimatedTime>
) {
  const entrance = useStaggerEntrance();

  return <AnimatedTime {...props} entrance={entrance} />;
}

function processTextString(
  text: string,
  keyPrefix: string,
  granularity: StaggerGranularity
): ReactNode {
  if (granularity === "word") {
    const parts = text.split(/(\s+)/).filter((part) => part.length > 0);

    return parts.map((part, index) => {
      if (/^\s+$/.test(part)) {
        return <Fragment key={`${keyPrefix}-ws-${index}`}>{part}</Fragment>;
      }

      return (
        <StaggerToken key={`${keyPrefix}-w-${index}`}>{part}</StaggerToken>
      );
    });
  }

  return [...text].map((char, index) => (
    <StaggerChar key={`${keyPrefix}-${index}`}>{char}</StaggerChar>
  ));
}

function processStaggerNode(
  node: ReactNode,
  keyPrefix: string,
  granularity: StaggerGranularity
): ReactNode {
  if (node == null || node === false || node === true) {
    return null;
  }

  if (typeof node === "string") {
    return processTextString(node, keyPrefix, granularity);
  }

  if (typeof node === "number") {
    return processTextString(String(node), keyPrefix, granularity);
  }

  if (Array.isArray(node)) {
    return node.map((child, index) => (
      <Fragment key={`${keyPrefix}-${index}`}>
        {processStaggerNode(child, `${keyPrefix}-${index}`, granularity)}
      </Fragment>
    ));
  }

  if (!isValidElement(node)) {
    return node;
  }

  if (node.type === AnimatedTime) {
    return (
      <StaggerAnimatedTime
        key={node.key ?? keyPrefix}
        {...(node.props as React.ComponentProps<typeof AnimatedTime>)}
      />
    );
  }

  if (isAtomicElement(node)) {
    return (
      <StaggerToken key={node.key ?? keyPrefix}>{node}</StaggerToken>
    );
  }

  const props = node.props as { children?: ReactNode };

  if (props.children == null) {
    return <StaggerToken key={node.key ?? keyPrefix}>{node}</StaggerToken>;
  }

  return cloneElement(
    node,
    { key: node.key ?? keyPrefix },
    processStaggerNode(props.children, keyPrefix, granularity)
  );
}

type StaggerTextProps = {
  children: ReactNode;
  className?: string;
};

export function StaggerText({ children, className }: StaggerTextProps) {
  const granularity = useStaggerGranularityContext();
  const content = useMemo(
    () =>
      Children.map(children, (child, index) =>
        processStaggerNode(child, `t-${index}`, granularity)
      ),
    [children, granularity]
  );

  if (className) {
    return <span className={cn("inline", className)}>{content}</span>;
  }

  return <>{content}</>;
}

export function StaggerSentence({ children, className }: StaggerTextProps) {
  const granularity = useStaggerGranularityContext();

  if (granularity === "sentence") {
    return <StaggerToken className={className}>{children}</StaggerToken>;
  }

  return <StaggerText className={className}>{children}</StaggerText>;
}
