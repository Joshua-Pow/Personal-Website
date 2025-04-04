"use client";

import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import {
  CurrentlyPlayingResponse,
  RecentlyPlayedResponse,
} from "@/lib/spotify";

function formatLastPlayedTime(timestamp: string | undefined) {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const timeZone = "America/New_York";
  const formatted = date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
    hour12: true,
  });
  const tzString = date
    .toLocaleString("en-US", {
      timeZone,
      timeZoneName: "short",
    })
    .split(" ")
    .pop();
  return `${formatted} ${tzString}`;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function SpotifyContent({
  currentlyPlaying,
  lastPlayed,
}: {
  currentlyPlaying: CurrentlyPlayingResponse;
  lastPlayed: RecentlyPlayedResponse["items"][0];
}) {
  const track = currentlyPlaying?.item ?? lastPlayed?.track;

  if (!track) return null;

  return (
    <div className="group relative rounded-lg bg-white/40 p-1 transition-all">
      <div className="relative mb-1 flex items-center gap-4 rounded-md bg-gradient-to-br from-orange-50 via-orange-100 to-yellow-50 p-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]">
        <div className="relative h-16 w-16 flex-shrink-0">
          <Image
            src={track.album.images[0].url}
            alt={track.album.name}
            className="rounded-md"
            fill
            sizes="64px"
          />
        </div>

        <div className="flex min-w-0 flex-col text-sm">
          <Link
            href={track.external_urls.spotify}
            target="_blank"
            className="truncate font-medium underline decoration-gray-400/70 decoration-2 underline-offset-1 transition-colors duration-100 hover:decoration-orange-500"
          >
            {track.name}
          </Link>
          <p className="truncate opacity-50">
            {track.artists.map((artist) => artist.name).join(", ")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 pl-1 text-xs">
        {currentlyPlaying?.is_playing ? (
          <>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500 before:absolute before:h-full before:w-full before:animate-ping before:rounded-full before:bg-green-500 before:opacity-75" />
            <span className="opacity-30">Now Playing</span>
          </>
        ) : (
          <>
            <span className="inline-flex h-2 w-2 rounded-full bg-gray-400" />
            <span className="opacity-30">
              {lastPlayed?.played_at
                ? `Last played on ${formatLastPlayedTime(lastPlayed.played_at)}`
                : "Not recently played"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function SpotifyWidgetSkeleton() {
  return (
    <div className="h-[100px] w-full animate-pulse rounded-lg bg-white/40 p-1">
      <div className="relative mb-1 flex h-[72px] items-center gap-4 rounded-md bg-gradient-to-br from-orange-50 via-orange-100 to-yellow-50 p-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]">
        <div className="h-16 w-16 flex-shrink-0 rounded-md bg-white/80" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-5 w-3/4 rounded bg-white/80" />
          <div className="h-5 w-1/2 rounded bg-white/80" />
        </div>
      </div>
      <div className="flex items-center gap-2 pl-1">
        <div className="h-2 w-2 rounded-full bg-white/80" />
        <div className="h-4 w-1/3 rounded bg-white/80" />
      </div>
    </div>
  );
}

export default function SpotifyWidget() {
  const { data, isLoading } = useSWR<{
    currentlyPlaying: CurrentlyPlayingResponse;
    lastPlayed: RecentlyPlayedResponse["items"][0];
  }>("/api/spotify", fetcher, {
    refreshInterval: 30000, // 30 seconds
    revalidateOnFocus: true,
  });

  if (isLoading) return <SpotifyWidgetSkeleton />;
  if (!data) return null;

  return <SpotifyContent {...data} />;
}
