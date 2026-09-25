import { SPOTIFY_EMBED_HEIGHT, SPOTIFY_EMBED_WIDTH } from "./shared";

export interface EmbedConfig {
  src: string;
  native: boolean;
  width: number;
  height: number;
  allow?: string;
}

export function getSpotifyEmbedConfig(href: string): EmbedConfig | null {
  const match = href.match(
    /open\.spotify\.com\/(?<kind>track|album|playlist|artist|episode)\/(?<id>[a-zA-Z0-9]+)/u
  );

  if (!match?.groups) {
    return null;
  }

  const { kind, id } = match.groups;

  return {
    src: `https://open.spotify.com/embed/${kind}/${id}?utm_source=generator&theme=0`,
    native: true,
    width: SPOTIFY_EMBED_WIDTH,
    height: SPOTIFY_EMBED_HEIGHT,
    allow:
      "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture",
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
