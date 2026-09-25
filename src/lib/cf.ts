import { env } from "cloudflare:workers";

export interface SpotifyWorkerEnv {
  SPOTIFY_CLIENT_ID?: string;
  SPOTIFY_CLIENT_SECRET?: string;
  SPOTIFY_REFRESH_TOKEN?: string;
}

export function getWorkerEnv() {
  // SAFETY: The Cloudflare Vite plugin injects the generated Worker `env` at
  // runtime; Spotify secrets are optional string bindings not present on
  // CloudflareEnv.
  return env as CloudflareEnv & SpotifyWorkerEnv;
}

export function getRequestCf(request: Request) {
  if (!("cf" in request)) {
    return;
  }

  // SAFETY: Cloudflare Workers attach `cf` on incoming Request; the DOM
  // Request type omits that field.
  const { cf } = request as Request & { cf?: IncomingRequestCfProperties };
  return cf;
}
