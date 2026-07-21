import { cache } from "react";

interface SpotifyToken {
  access_token: string;
  token_type: string;
  expires_in: number;
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

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

function requireSpotifyConfig() {
  if (!client_id || !client_secret || !refresh_token) {
    throw new Error(
      "Missing Spotify credentials (SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN)"
    );
  }

  return { client_id, client_secret, refresh_token };
}

async function getAccessToken(): Promise<string> {
  const { client_id, client_secret, refresh_token } = requireSpotifyConfig();
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
    // Access tokens last ~1h; avoid serving a stale cached token after a secret rotation.
    cache: "no-store",
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

  if (!response.ok || !data.access_token) {
    const detail = data.error_description || data.error || rawBody || "unknown error";
    throw new Error(
      `Spotify token refresh failed (${response.status}): ${detail}`
    );
  }

  return data.access_token;
}

async function fetchCurrentlyPlaying(
  token: string
): Promise<CurrentlyPlayingResponse | null> {
  const response = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
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
      },
      cache: "no-store",
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

export const getSpotifyData = cache(async () => {
  const token = await getAccessToken();
  const [currentlyPlaying, lastPlayedRaw] = await Promise.all([
    fetchCurrentlyPlaying(token),
    fetchLastPlayed(token),
  ]);
  const lastPlayed = currentlyPlaying?.is_playing ? null : lastPlayedRaw;

  return { currentlyPlaying, lastPlayed };
});
