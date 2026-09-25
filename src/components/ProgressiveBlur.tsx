import { motion, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { useEdgeIntensity } from "./EdgeBorderEffect";

const DEFAULT_BLUR_LEVELS = [0.5, 1, 2, 4, 8, 16, 32, 64];

type BlurPosition = "top" | "bottom" | "both";

export interface ProgressiveBlurProps {
  className?: string;
  height?: string;
  position?: BlurPosition;
  blurLevels?: number[];
  children?: ReactNode;
}

function radiusStyleFor(
  position: BlurPosition,
  borderRadius: MotionValue<string>
) {
  if (position === "top") {
    return {
      borderTopLeftRadius: borderRadius,
      borderTopRightRadius: borderRadius,
    };
  }
  if (position === "bottom") {
    return {
      borderBottomLeftRadius: borderRadius,
      borderBottomRightRadius: borderRadius,
    };
  }
  return { borderRadius };
}

function positionClassName(position: BlurPosition) {
  if (position === "top") {
    return "top-0";
  }
  if (position === "bottom") {
    return "bottom-0";
  }
  return "inset-y-0";
}

function bothMask() {
  return "linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,1) 5%, rgba(0,0,0,1) 95%, rgba(0,0,0,0) 100%)";
}

function directionalMask(
  position: BlurPosition,
  start: string,
  mid: string,
  end: string,
  fade: string
) {
  if (position === "both") {
    return bothMask();
  }
  const direction = position === "bottom" ? "to bottom" : "to top";
  return `linear-gradient(${direction}, rgba(0,0,0,0) ${start}, rgba(0,0,0,1) ${mid}, rgba(0,0,0,1) ${end}, rgba(0,0,0,0) ${fade})`;
}

function firstLayerMask(position: BlurPosition) {
  return directionalMask(position, "0%", "12.5%", "25%", "37.5%");
}

function lastLayerMask(position: BlurPosition) {
  if (position === "both") {
    return bothMask();
  }
  const direction = position === "bottom" ? "to bottom" : "to top";
  return `linear-gradient(${direction}, rgba(0,0,0,0) 87.5%, rgba(0,0,0,1) 100%)`;
}

function layerMask(position: BlurPosition, blurIndex: number) {
  const startPercent = blurIndex * 12.5;
  const midPercent = (blurIndex + 1) * 12.5;
  const endPercent = (blurIndex + 2) * 12.5;
  return directionalMask(
    position,
    `${startPercent}%`,
    `${midPercent}%`,
    `${endPercent}%`,
    `${endPercent + 12.5}%`
  );
}

function blurLayerStyle(
  zIndex: number,
  blurPx: number,
  maskImage: string
): CSSProperties {
  return {
    zIndex,
    backdropFilter: `blur(${blurPx}px)`,
    WebkitBackdropFilter: `blur(${blurPx}px)`,
    maskImage,
    WebkitMaskImage: maskImage,
  };
}

export function ProgressiveBlur({
  className,
  height = "30%",
  position = "bottom",
  blurLevels = DEFAULT_BLUR_LEVELS,
}: ProgressiveBlurProps) {
  const { intensity } = useEdgeIntensity();
  const borderRadius = useTransform(intensity, (v) => `${v * 16}px`);
  const innerCount = Math.max(0, blurLevels.length - 2);
  const innerIndexes = Array.from({ length: innerCount }, (_, index) => index);
  const firstBlur = blurLevels[0] ?? 0;
  const lastBlur = blurLevels.at(-1) ?? 0;

  return (
    <motion.div
      className={cn(
        "gradient-blur pointer-events-none absolute inset-x-0 z-10",
        className,
        positionClassName(position)
      )}
      style={{
        height: position === "both" ? "100%" : height,
        overflow: "hidden",
        ...radiusStyleFor(position, borderRadius),
      }}
    >
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={blurLayerStyle(1, firstBlur, firstLayerMask(position))}
        />

        {innerIndexes.map((index) => {
          const blurIndex = index + 1;
          const blurPx = blurLevels[blurIndex] ?? 0;
          const maskGradient = layerMask(position, blurIndex);

          return (
            <div
              key={`blur-${index}`}
              className="absolute inset-0"
              style={blurLayerStyle(index + 2, blurPx, maskGradient)}
            />
          );
        })}

        <div
          className="absolute inset-0"
          style={blurLayerStyle(
            blurLevels.length,
            lastBlur,
            lastLayerMask(position)
          )}
        />
      </div>
    </motion.div>
  );
}

export default ProgressiveBlur;
