import { getWorkerEnv } from "@/lib/cf";
import type {
  CurrentlyPlayingResponse,
  RecentlyPlayedResponse,
  SpotifyApiResponse,
} from "@/lib/spotify-display";

export type {
  CurrentlyPlayingResponse,
  RecentlyPlayedResponse,
  SpotifyApiResponse,
  SpotifyDisplayItem,
  SpotifyEpisode,
  SpotifyPlayableItem,
  SpotifyTrack,
} from "@/lib/spotify-display";
export { toDisplayItem } from "@/lib/spotify-display";

interface SpotifyToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

interface SpotifyCredentials {
  client_id: string;
  client_secret: string;
  refresh_token: string;
}

const spotifyFetchInit = {
  cache: "no-store" as const,
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isObjectValue(value: unknown): value is object {
  return value !== null && Object(value) === value && !Array.isArray(value);
}

function isSpotifyToken(value: unknown): value is SpotifyToken {
  if (!isObjectValue(value) || !("access_token" in value)) {
    return false;
  }
  return isNonEmptyString(value.access_token);
}

function readEnvValue(
  name: "SPOTIFY_CLIENT_ID" | "SPOTIFY_CLIENT_SECRET" | "SPOTIFY_REFRESH_TOKEN"
) {
  const workerEnv = getWorkerEnv();
  if (isNonEmptyString(workerEnv[name])) {
    return workerEnv[name];
  }
  const fromProcess = process.env[name];
  return isNonEmptyString(fromProcess) ? fromProcess : undefined;
}

function getSpotifyCredentials(): SpotifyCredentials {
  const client_id = readEnvValue("SPOTIFY_CLIENT_ID");
  const client_secret = readEnvValue("SPOTIFY_CLIENT_SECRET");
  const refresh_token = readEnvValue("SPOTIFY_REFRESH_TOKEN");

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
  const { client_id, client_secret, refresh_token } = getSpotifyCredentials();
  const basic = btoa(`${client_id}:${client_secret}`);

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
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawBody);
  } catch {
    throw new Error(
      `Spotify token refresh returned non-JSON response (${response.status})`
    );
  }

  if (!isSpotifyToken(parsed)) {
    let detail = rawBody;
    if (
      isObjectValue(parsed) &&
      "error_description" in parsed &&
      isNonEmptyString(parsed.error_description)
    ) {
      detail = parsed.error_description;
    } else if (
      isObjectValue(parsed) &&
      "error" in parsed &&
      isNonEmptyString(parsed.error)
    ) {
      detail = parsed.error;
    }
    throw new Error(
      `Spotify token refresh failed (${response.status}): ${detail || "unknown error"}`
    );
  }

  if (!response.ok) {
    throw new Error(
      `Spotify token refresh failed (${response.status}): ${rawBody || "unknown error"}`
    );
  }

  return parsed.access_token.trim();
}

async function fetchCurrentlyPlaying(
  token: string
): Promise<CurrentlyPlayingResponse | null> {
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

  if (response.status === 204) {
    return null;
  }

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

function errorMessageFromRejection(result: PromiseRejectedResult): string {
  const { reason } = result;
  if (reason instanceof Error) {
    return reason.message;
  }
  return String(reason);
}

export async function getSpotifyData(): Promise<SpotifyApiResponse> {
  const token = await getAccessToken();

  const [currentlyPlayingResult, lastPlayedResult] = await Promise.allSettled([
    fetchCurrentlyPlaying(token),
    fetchLastPlayed(token),
  ]);

  if (currentlyPlayingResult.status === "rejected") {
    console.error(
      "Spotify currently-playing error:",
      errorMessageFromRejection(currentlyPlayingResult)
    );
  }
  if (lastPlayedResult.status === "rejected") {
    console.error(
      "Spotify recently-played error:",
      errorMessageFromRejection(lastPlayedResult)
    );
  }

  if (
    currentlyPlayingResult.status === "rejected" &&
    lastPlayedResult.status === "rejected"
  ) {
    throw new Error(
      `Spotify player requests failed: ${errorMessageFromRejection(currentlyPlayingResult)}; ${errorMessageFromRejection(lastPlayedResult)}`
    );
  }

  const currentlyPlaying =
    currentlyPlayingResult.status === "fulfilled"
      ? currentlyPlayingResult.value
      : null;
  const lastPlayedRaw =
    lastPlayedResult.status === "fulfilled" ? lastPlayedResult.value : null;

  const hasLiveItem = Boolean(currentlyPlaying?.item);
  const lastPlayed =
    currentlyPlaying?.is_playing && hasLiveItem ? null : lastPlayedRaw;

  return { currentlyPlaying, lastPlayed };
}
