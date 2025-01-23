import { cache } from "react";

interface SpotifyToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyTrack {
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

const client_id = process.env.SPOTIFY_CLIENT_ID!;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET!;
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN!;

async function getAccessToken(): Promise<string> {
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
    next: { revalidate: 3600 }, // Token lasts for 1 hour
  });

  const data: SpotifyToken = await response.json();
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
      // next: { revalidate: 30 }, // Revalidate every 30 seconds
    }
  );

  if (response.status === 204) return null;
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
      // next: { revalidate: 30 }, // Revalidate every 30 seconds
    }
  );

  const data: RecentlyPlayedResponse = await response.json();
  return data.items?.[0] || null;
}

export const getSpotifyData = cache(async () => {
  const token = await getAccessToken();
  const currentlyPlaying = await fetchCurrentlyPlaying(token);
  const lastPlayed = !currentlyPlaying?.is_playing
    ? await fetchLastPlayed(token)
    : null;

  return { currentlyPlaying, lastPlayed };
});
