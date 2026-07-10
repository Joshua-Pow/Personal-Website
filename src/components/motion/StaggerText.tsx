"use client";

import AnimatedTime from "@/components/AnimatedTime";
import { useStaggerGranularityContext, useStaggerItem } from "@/components/motion/Stagger";
import { WordPopover } from "@/components/WordPopover";
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
  return element.type === WordPopover || element.type === AnimatedTime;
}

function staggerStyle(delay: number, duration: number): CSSProperties {
  return {
    "--stagger-delay": `${delay}s`,
    "--stagger-duration": `${duration}s`,
  } as CSSProperties;
}

function StaggerChar({ children }: { children: string }) {
  const { delay, duration, reducedMotion } = useStaggerItem();

  if (reducedMotion) {
    return <>{children}</>;
  }

  return (
    <span className="stagger-reveal inline" style={staggerStyle(delay, duration)}>
      {children}
    </span>
  );
}

function StaggerUnit({ children }: { children: ReactNode }) {
  const { delay, duration, reducedMotion } = useStaggerItem();

  if (reducedMotion) {
    return <span className="inline">{children}</span>;
  }

  return (
    <span className="stagger-reveal inline" style={staggerStyle(delay, duration)}>
      {children}
    </span>
  );
}

function processCharNode(node: ReactNode, keyPrefix: string): ReactNode {
  if (node == null || node === false || node === true) {
    return null;
  }

  if (typeof node === "string") {
    return [...node].map((char, index) => (
      <StaggerChar key={`${keyPrefix}-${index}`}>{char}</StaggerChar>
    ));
  }

  if (typeof node === "number") {
    return processCharNode(String(node), keyPrefix);
  }

  if (Array.isArray(node)) {
    return node.map((child, index) => (
      <Fragment key={`${keyPrefix}-${index}`}>
        {processCharNode(child, `${keyPrefix}-${index}`)}
      </Fragment>
    ));
  }

  if (!isValidElement(node)) {
    return node;
  }

  if (isAtomicElement(node)) {
    return <StaggerUnit key={node.key ?? keyPrefix}>{node}</StaggerUnit>;
  }

  const props = node.props as { children?: ReactNode };

  if (props.children == null) {
    return <StaggerUnit key={node.key ?? keyPrefix}>{node}</StaggerUnit>;
  }

  return cloneElement(
    node,
    { key: node.key ?? keyPrefix },
    processCharNode(props.children, keyPrefix)
  );
}

type StaggerTextProps = {
  children: ReactNode;
  className?: string;
};

export function StaggerText({ children, className }: StaggerTextProps) {
  const content = useMemo(
    () =>
      Children.map(children, (child, index) =>
        processCharNode(child, `t-${index}`)
      ),
    [children]
  );

  if (className) {
    return <span className={cn("inline", className)}>{content}</span>;
  }

  return <>{content}</>;
}

export function StaggerSentence({ children, className }: StaggerTextProps) {
  const granularity = useStaggerGranularityContext();

  if (granularity === "char") {
    return <StaggerText className={className}>{children}</StaggerText>;
  }

  return <StaggerUnit>{children}</StaggerUnit>;
}
