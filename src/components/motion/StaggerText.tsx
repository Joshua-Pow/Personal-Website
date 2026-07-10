"use client";

import AnimatedTime from "@/components/AnimatedTime";
import {
  useStaggerGranularityContext,
  useStaggerItem,
} from "@/components/motion/Stagger";
import { useIsClientMounted } from "@/hooks/useStaggerGranularity";
import { WordPopover } from "@/components/WordPopover";
import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  useMemo,
  type ReactElement,
  type ReactNode,
} from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils/cn";

function isAtomicElement(element: ReactElement): boolean {
  return element.type === WordPopover || element.type === AnimatedTime;
}

function StaggerChar({ children }: { children: string }) {
  const { v, transition, reducedMotion } = useStaggerItem();
  const isClient = useIsClientMounted();

  if (reducedMotion || !isClient) {
    return <>{children}</>;
  }

  return (
    <motion.span
      className="inline"
      style={{ transformOrigin: "left bottom" }}
      initial={v.initial}
      animate={v.animate}
      transition={transition}
    >
      {children}
    </motion.span>
  );
}

function StaggerUnit({ children }: { children: ReactNode }) {
  const { v, transition, reducedMotion } = useStaggerItem();
  const isClient = useIsClientMounted();

  if (reducedMotion || !isClient) {
    return <span className="inline">{children}</span>;
  }

  return (
    <motion.span
      className="inline"
      style={{ transformOrigin: "left bottom" }}
      initial={v.initial}
      animate={v.animate}
      transition={transition}
    >
      {children}
    </motion.span>
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
