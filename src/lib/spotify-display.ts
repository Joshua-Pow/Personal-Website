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

export const spotifyQueryKey = ["spotify"] as const;

function isEpisode(item: SpotifyPlayableItem): item is SpotifyEpisode {
  return item.type === "episode" || "show" in item;
}

export function toDisplayItem(
  item: SpotifyPlayableItem
): SpotifyDisplayItem | null {
  if (isEpisode(item)) {
    const [episodeImage] = item.images;
    const [showImage] = item.show.images;
    const image = episodeImage ?? showImage;
    if (!image?.url) {
      return null;
    }

    return {
      name: item.name,
      subtitle: item.show.name,
      imageUrl: image.url,
      imageAlt: item.show.name,
      url: item.external_urls.spotify,
      kind: "episode",
    };
  }

  const [image] = item.album.images;
  if (!image?.url) {
    return null;
  }

  return {
    name: item.name,
    subtitle: item.artists.map((artist) => artist.name).join(", "),
    imageUrl: image.url,
    imageAlt: item.album.name,
    url: item.external_urls.spotify,
    kind: "track",
  };
}

export async function fetchSpotifyData(): Promise<SpotifyApiResponse> {
  const response = await fetch("/api/spotify");
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}
