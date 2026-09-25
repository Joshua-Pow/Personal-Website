import { getSpotifyEmbedConfig } from "./embed-url";

const SPOTIFY_IFRAME_SANDBOX =
  "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-presentation";

export function SpotifyEmbedPreview({ href }: { href: string }) {
  const embed = getSpotifyEmbedConfig(href);
  if (!embed) {
    return null;
  }

  return (
    <iframe
      src={embed.src}
      title="Spotify preview"
      width={embed.width}
      height={embed.height}
      className="block overflow-hidden rounded-xl border-0"
      allow={embed.allow}
      sandbox={SPOTIFY_IFRAME_SANDBOX}
      loading="lazy"
      tabIndex={-1}
    />
  );
}
