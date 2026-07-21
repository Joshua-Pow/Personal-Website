import { cache } from "react";
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface SpotifyToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export interface SpotifyTrack {
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  external_urls: {
    spotify: string;
  };
}

export interface CurrentlyPlayingResponse {
  is_playing: boolean;
  item: SpotifyTrack | null;
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
  const response = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
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
  const lastPlayed = currentlyPlaying?.is_playing ? null : lastPlayedRaw;

  return { currentlyPlaying, lastPlayed };
});
