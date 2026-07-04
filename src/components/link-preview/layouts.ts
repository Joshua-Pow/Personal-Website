import { getSpotifyEmbedConfig } from "./embed-url";

export type PreviewLayout = "default" | "spotify";

export function getPreviewLayout(href: string): PreviewLayout {
  if (getSpotifyEmbedConfig(href)) return "spotify";
  return "default";
}

export function isBareEmbedPreview(href: string): boolean {
  return getPreviewLayout(href) === "spotify";
}

export const previewShellWidthClass: Record<PreviewLayout, string> = {
  default: "w-[min(12rem,calc(100vw-3rem))]",
  spotify: "w-[min(300px,calc(100vw-3rem))]",
};
