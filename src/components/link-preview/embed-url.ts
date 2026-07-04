import { SPOTIFY_EMBED_HEIGHT, SPOTIFY_EMBED_WIDTH } from "./shared";

export type EmbedConfig = {
  src: string;
  native: boolean;
  width: number;
  height: number;
  allow?: string;
};

export function getSpotifyEmbedConfig(href: string): EmbedConfig | null {
  const match = href.match(
    /open\.spotify\.com\/(track|album|playlist|artist|episode)\/([a-zA-Z0-9]+)/
  );

  if (!match) return null;

  const [, type, id] = match;

  return {
    src: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
    native: true,
    width: SPOTIFY_EMBED_WIDTH,
    height: SPOTIFY_EMBED_HEIGHT,
    allow: "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture",
  };
}

export function isSpotifyUrl(href: string): boolean {
  return getSpotifyEmbedConfig(href) !== null;
}

export function getPreviewEmbedConfig(href: string): EmbedConfig | null {
  return getSpotifyEmbedConfig(href);
}

export function shouldShowIframePreview(
  href: string,
  embeddable: boolean
): boolean {
  return getPreviewEmbedConfig(href) !== null || embeddable;
}
