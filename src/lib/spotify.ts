import { cache } from "react";
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface SpotifyToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

interface SpotifyImage {
  url: string;
  height?: number | null;
  width?: number | null;
}

export interface SpotifyTrack {
  type?: "track";
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: SpotifyImage[];
  };
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyEpisode {
  type: "episode";
  name: string;
  images: SpotifyImage[];
  external_urls: {
    spotify: string;
  };
  show: {
    name: string;
    publisher: string;
    images: SpotifyImage[];
  };
}

export type SpotifyPlayableItem = SpotifyTrack | SpotifyEpisode;

/** Normalized fields for the now-playing / last-played card. */
export interface SpotifyDisplayItem {
  name: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
  url: string;
  kind: "track" | "episode";
}

export interface CurrentlyPlayingResponse {
  is_playing: boolean;
  currently_playing_type?: "track" | "episode" | "ad" | "unknown";
  item: SpotifyPlayableItem | null;
}

export interface RecentlyPlayedResponse {
  items: {
    track: SpotifyTrack;
    played_at: string;
  }[];
}

export interface SpotifyApiResponse {
  currentlyPlaying: CurrentlyPlayingResponse | null;
  lastPlayed: RecentlyPlayedResponse["items"][0] | null;
}

type SpotifyCredentials = {
  client_id: string;
  client_secret: string;
  refresh_token: string;
};

const spotifyFetchInit = {
  // Avoid Next/OpenNext fetch caching of authenticated Spotify responses.
  cache: "no-store" as const,
  next: { revalidate: 0 },
};

async function getSpotifyCredentials(): Promise<SpotifyCredentials> {
  let client_id = process.env.SPOTIFY_CLIENT_ID;
  let client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  let refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

  try {
    const { env } = getCloudflareContext();
    const cloudflareEnv = env as {
      SPOTIFY_CLIENT_ID?: string;
      SPOTIFY_CLIENT_SECRET?: string;
      SPOTIFY_REFRESH_TOKEN?: string;
    };

    client_id = cloudflareEnv.SPOTIFY_CLIENT_ID ?? client_id;
    client_secret = cloudflareEnv.SPOTIFY_CLIENT_SECRET ?? client_secret;
    refresh_token = cloudflareEnv.SPOTIFY_REFRESH_TOKEN ?? refresh_token;
  } catch {
    // Local Next.js dev may not have a Cloudflare request context.
  }

  if (!client_id || !client_secret || !refresh_token) {
    throw new Error(
      "Missing Spotify credentials (SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN)"
    );
  }

  return {
    client_id: client_id.trim(),
    client_secret: client_secret.trim(),
    refresh_token: refresh_token.trim(),
  };
}

export function toDisplayItem(
  item: SpotifyPlayableItem
): SpotifyDisplayItem | null {
  // Audiobook chapters and podcasts both arrive as EpisodeObjects.
  if (item.type === "episode" || "show" in item) {
    const episode = item as SpotifyEpisode;
    const image = episode.images[0] ?? episode.show.images[0];
    if (!image?.url) return null;

    return {
      name: episode.name,
      subtitle: episode.show.name,
      imageUrl: image.url,
      imageAlt: episode.show.name,
      url: episode.external_urls.spotify,
      kind: "episode",
    };
  }

  const image = item.album.images[0];
  if (!image?.url) return null;

  return {
    name: item.name,
    subtitle: item.artists.map((artist) => artist.name).join(", "),
    imageUrl: image.url,
    imageAlt: item.album.name,
    url: item.external_urls.spotify,
    kind: "track",
  };
}

async function getAccessToken(): Promise<string> {
  const { client_id, client_secret, refresh_token } =
    await getSpotifyCredentials();
  const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token,
    }),
    ...spotifyFetchInit,
  });

  const rawBody = await response.text();
  let data: SpotifyToken & { error?: string; error_description?: string };

  try {
    data = JSON.parse(rawBody) as SpotifyToken & {
      error?: string;
      error_description?: string;
    };
  } catch {
    throw new Error(
      `Spotify token refresh returned non-JSON response (${response.status})`
    );
  }

  const accessToken = data.access_token?.trim();
  if (!response.ok || !accessToken) {
    const detail =
      data.error_description || data.error || rawBody || "unknown error";
    throw new Error(
      `Spotify token refresh failed (${response.status}): ${detail}`
    );
  }

  return accessToken;
}

async function fetchCurrentlyPlaying(
  token: string
): Promise<CurrentlyPlayingResponse | null> {
  // Without additional_types=episode, Spotify returns currently_playing_type
  // "episode" (podcasts / audiobook chapters) with item: null.
  const response = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing?additional_types=episode",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      ...spotifyFetchInit,
    }
  );

  if (response.status === 204) return null;

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Spotify currently-playing failed (${response.status}): ${body || "unknown error"}`
    );
  }

  return response.json();
}

async function fetchLastPlayed(
  token: string
): Promise<RecentlyPlayedResponse["items"][0] | null> {
  // Recently-played only returns music tracks — not episodes/audiobooks.
  const response = await fetch(
    "https://api.spotify.com/v1/me/player/recently-played?limit=1",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      ...spotifyFetchInit,
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Spotify recently-played failed (${response.status}): ${body || "unknown error"}`
    );
  }

  const data: RecentlyPlayedResponse = await response.json();
  return data.items?.[0] || null;
}

function reasonMessage(reason: unknown) {
  return reason instanceof Error ? reason.message : String(reason);
}

export const getSpotifyData = cache(async () => {
  const token = await getAccessToken();

  // Don't fail the whole widget if only one player endpoint errors.
  const [currentlyPlayingResult, lastPlayedResult] = await Promise.allSettled([
    fetchCurrentlyPlaying(token),
    fetchLastPlayed(token),
  ]);

  if (currentlyPlayingResult.status === "rejected") {
    console.error(
      "Spotify currently-playing error:",
      reasonMessage(currentlyPlayingResult.reason)
    );
  }
  if (lastPlayedResult.status === "rejected") {
    console.error(
      "Spotify recently-played error:",
      reasonMessage(lastPlayedResult.reason)
    );
  }

  if (
    currentlyPlayingResult.status === "rejected" &&
    lastPlayedResult.status === "rejected"
  ) {
    throw new Error(
      `Spotify player requests failed: ${reasonMessage(currentlyPlayingResult.reason)}; ${reasonMessage(lastPlayedResult.reason)}`
    );
  }

  const currentlyPlaying =
    currentlyPlayingResult.status === "fulfilled"
      ? currentlyPlayingResult.value
      : null;
  const lastPlayedRaw =
    lastPlayedResult.status === "fulfilled" ? lastPlayedResult.value : null;

  // Prefer a live item; if Spotify says we're playing but item is still null
  // (ads / unknown), fall back to last played so the card doesn't vanish.
  const hasLiveItem = Boolean(currentlyPlaying?.item);
  const lastPlayed =
    currentlyPlaying?.is_playing && hasLiveItem ? null : lastPlayedRaw;

  return { currentlyPlaying, lastPlayed };
});
