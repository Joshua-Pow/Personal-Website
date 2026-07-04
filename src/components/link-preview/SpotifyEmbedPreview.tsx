"use client";

import { getSpotifyEmbedConfig } from "./embed-url";

export function SpotifyEmbedPreview({ href }: { href: string }) {
  const embed = getSpotifyEmbedConfig(href);
  if (!embed) return null;

  return (
    <iframe
      src={embed.src}
      title="Spotify preview"
      width={embed.width}
      height={embed.height}
      className="block overflow-hidden rounded-xl border-0"
      allow={embed.allow}
      loading="lazy"
      tabIndex={-1}
    />
  );
}
