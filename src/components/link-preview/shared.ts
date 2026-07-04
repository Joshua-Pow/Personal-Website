import type { LinkPreviewData } from "@/lib/link-preview";
import { buildFallbackPreview } from "@/lib/link-preview";
import { mutate, preload } from "swr";

export const IFRAME_WIDTH = 1280;
export const IFRAME_HEIGHT = 720;
export const PREVIEW_WIDTH = 192;
export const PREVIEW_SCALE = PREVIEW_WIDTH / IFRAME_WIDTH;
export const PREVIEW_HEIGHT = IFRAME_HEIGHT * PREVIEW_SCALE;
export const PREVIEW_HEADER_HEIGHT = 28;
export const PREVIEW_FOOTER_HEIGHT = 28;
export const PREVIEW_PANEL_HEIGHT =
  PREVIEW_HEADER_HEIGHT + PREVIEW_HEIGHT + PREVIEW_FOOTER_HEIGHT;

export const SPOTIFY_EMBED_WIDTH = 520;
export const SPOTIFY_EMBED_HEIGHT = 152;

const previewPopupBaseClassName =
  "flex origin-[var(--transform-origin)] flex-col overflow-hidden rounded-xl border border-[var(--popover-border)] bg-[var(--popover-bg)] shadow-[0_10px_30px_rgba(0,0,0,0.35),0_2px_8px_rgba(0,0,0,0.2)] backdrop-blur-md focus:outline-none supports-[backdrop-filter]:bg-[var(--popover-bg)]";

export const previewPanelSizeClassName =
  "h-[var(--preview-panel-height)] w-[min(12rem,calc(100vw-3rem))]";

export const previewPopupClassName = [
  previewPopupBaseClassName,
  previewPanelSizeClassName,
].join(" ");

export const morphingPreviewPopupClassName = [
  previewPopupBaseClassName,
  "h-[var(--popup-height,auto)] w-[var(--popup-width)]",
  "min-h-[var(--preview-panel-height)] min-w-[12rem]",
  "transition-[width,height,opacity,scale] duration-[350ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
  "data-instant:transition-none",
].join(" ");

export const morphingPreviewPositionerClassName = [
  "z-50 h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)]",
  "min-h-[var(--preview-panel-height)] min-w-[12rem]",
  "transition-[top,left,right,bottom,transform,width,height] duration-[350ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
  "data-instant:transition-none",
].join(" ");

export const bareEmbedPopupClassName =
  "z-50 w-fit overflow-visible border-0 bg-transparent p-0 shadow-none focus-visible:outline-none";

export const bareEmbedPositionerClassName =
  "z-50 h-fit w-fit max-w-[calc(100vw-3rem)] overflow-visible";

export const bareMorphingPreviewPopupClassName = [
  morphingPreviewPopupClassName,
  "min-h-0 min-w-0 overflow-visible border-0 bg-transparent p-0 shadow-none backdrop-blur-none",
  "supports-[backdrop-filter]:bg-transparent focus-visible:outline-none",
].join(" ");

export const bareMorphingPreviewPositionerClassName = [
  morphingPreviewPositionerClassName,
  "min-h-0 min-w-0",
].join(" ");

export const footerPreviewPopupClassName = [
  previewPopupBaseClassName,
  "h-[var(--popup-height,auto)] w-[var(--popup-width)]",
  "min-h-[var(--preview-panel-height)] min-w-[12rem]",
  "transition-[width,height,border-color,background-color,box-shadow,backdrop-filter] duration-[350ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
  "data-instant:transition-none",
  "data-[bare]:min-h-0 data-[bare]:min-w-0 data-[bare]:overflow-visible data-[bare]:border-0 data-[bare]:bg-transparent data-[bare]:p-0 data-[bare]:shadow-none data-[bare]:backdrop-blur-none",
  "data-[bare]:supports-[backdrop-filter]:bg-transparent",
].join(" ");

export const footerMorphingPreviewPositionerClassName = [
  "z-50 h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)]",
  "transition-[top,left,right,bottom,transform,width,height] duration-[350ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
  "data-instant:transition-none",
].join(" ");

export const footerPreviewViewportSwipeClassName = [
  "relative h-full w-full overflow-clip",
  "[&_[data-current]]:w-full [&_[data-current]]:translate-x-0 [&_[data-current]]:opacity-100",
  "[&_[data-current]]:transition-[transform,opacity] [&_[data-current]]:duration-[350ms,175ms]",
  "[&_[data-current]]:ease-[cubic-bezier(0.23,1,0.32,1)]",
  "data-[activation-direction~='left']:[&_[data-current][data-starting-style]]:-translate-x-1/2",
  "data-[activation-direction~='left']:[&_[data-current][data-starting-style]]:opacity-0",
  "data-[activation-direction~='right']:[&_[data-current][data-starting-style]]:translate-x-1/2",
  "data-[activation-direction~='right']:[&_[data-current][data-starting-style]]:opacity-0",
  "[&_[data-previous]]:w-full [&_[data-previous]]:translate-x-0 [&_[data-previous]]:opacity-100",
  "[&_[data-previous]]:transition-[transform,opacity] [&_[data-previous]]:duration-[350ms,175ms]",
  "[&_[data-previous]]:ease-[cubic-bezier(0.23,1,0.32,1)]",
  "data-[activation-direction~='left']:[&_[data-previous][data-ending-style]]:translate-x-1/2",
  "data-[activation-direction~='left']:[&_[data-previous][data-ending-style]]:opacity-0",
  "data-[activation-direction~='right']:[&_[data-previous][data-ending-style]]:-translate-x-1/2",
  "data-[activation-direction~='right']:[&_[data-previous][data-ending-style]]:opacity-0",
].join(" ");

export const previewViewportSwipeClassName = [
  "relative h-full w-full overflow-clip",
  "[&_[data-current]]:w-full [&_[data-current]]:translate-x-0 [&_[data-current]]:opacity-100",
  "[&_[data-current]]:transition-[translate,opacity] [&_[data-current]]:duration-[350ms,175ms]",
  "[&_[data-current]]:ease-[cubic-bezier(0.23,1,0.32,1)]",
  "data-[activation-direction~='left']:[&_[data-current][data-starting-style]]:-translate-x-1/2",
  "data-[activation-direction~='left']:[&_[data-current][data-starting-style]]:opacity-0",
  "data-[activation-direction~='right']:[&_[data-current][data-starting-style]]:translate-x-1/2",
  "data-[activation-direction~='right']:[&_[data-current][data-starting-style]]:opacity-0",
  "[&_[data-previous]]:w-full [&_[data-previous]]:translate-x-0 [&_[data-previous]]:opacity-100",
  "[&_[data-previous]]:transition-[translate,opacity] [&_[data-previous]]:duration-[350ms,175ms]",
  "[&_[data-previous]]:ease-[cubic-bezier(0.23,1,0.32,1)]",
  "data-[activation-direction~='left']:[&_[data-previous][data-ending-style]]:translate-x-1/2",
  "data-[activation-direction~='left']:[&_[data-previous][data-ending-style]]:opacity-0",
  "data-[activation-direction~='right']:[&_[data-previous][data-ending-style]]:-translate-x-1/2",
  "data-[activation-direction~='right']:[&_[data-previous][data-ending-style]]:opacity-0",
].join(" ");

export const previewFetcher = async (url: string): Promise<LinkPreviewData> => {
  try {
    const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);

    if (!response.ok) {
      return buildFallbackPreview(url);
    }

    return response.json();
  } catch {
    return buildFallbackPreview(url);
  }
};

function preloadPreviewImage(src: string | undefined) {
  if (!src || typeof window === "undefined") return;

  const image = new window.Image();
  image.decoding = "async";
  image.src = src;
}

export async function prefetchPreview(url: string): Promise<LinkPreviewData> {
  const data = await preload(url, previewFetcher);
  preloadPreviewImage(data.image);
  await mutate(url, data, { revalidate: false });
  return data;
}
