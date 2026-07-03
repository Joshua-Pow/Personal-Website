"use client";

import Image from "next/image";
import useSWR from "swr";
import { AnimatePresence, motion } from "motion/react";
import { MotionLink } from "@/components/motion/MotionLink";
import { durations, easeOut } from "@/lib/motion";
import type {
  SpotifyApiResponse,
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

const fetcher = async (url: string): Promise<SpotifyApiResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
};

function NowPlayingDot() {
  return (
    <motion.span
      className="relative inline-flex size-2 rounded-full bg-green-500"
      animate={{ scale: [1, 1.4, 1], opacity: [1, 0.75, 1] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: easeOut,
      }}
    />
  );
}

function SpotifyContent({
  currentlyPlaying,
  lastPlayed,
}: {
  currentlyPlaying: CurrentlyPlayingResponse | null;
  lastPlayed: RecentlyPlayedResponse["items"][0] | null;
}) {
  const track = currentlyPlaying?.item ?? lastPlayed?.track;

  if (!track) return null;

  const trackKey = `${track.name}-${track.artists.map((artist) => artist.name).join(",")}`;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={trackKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: durations.ui, ease: easeOut }}
        className="group relative h-fit shrink-0 rounded-lg bg-white/40 p-1"
      >
        <div className="relative mb-1 flex items-center gap-4 rounded-md bg-gradient-to-br from-orange-50 via-orange-100 to-yellow-50 p-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]">
          <div className="relative h-16 w-16 flex-shrink-0">
            <Image
              src={track.album.images[0].url}
              alt={track.album.name}
              blurDataURL={track.album.images[0].url}
              placeholder="blur"
              className="rounded-md"
              fill
              sizes="64px"
            />
          </div>

          <div className="flex min-w-0 flex-col text-sm">
            <MotionLink
              href={track.external_urls.spotify}
              target="_blank"
              className="truncate font-medium underline decoration-gray-400/70 decoration-2 underline-offset-1 hover:decoration-orange-500"
            >
              {track.name}
            </MotionLink>
            <p className="truncate opacity-50">
              {track.artists.map((artist) => artist.name).join(", ")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pl-1 text-xs">
          {currentlyPlaying?.is_playing ? (
            <>
              <NowPlayingDot />
              <span className="opacity-30">Now Playing</span>
            </>
          ) : (
            <>
              <span className="inline-flex size-2 rounded-full bg-gray-400" />
              <span className="opacity-30">
                {lastPlayed?.played_at
                  ? `Last played on ${formatLastPlayedTime(lastPlayed.played_at)}`
                  : "Not recently played"}
              </span>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function PulseBlock({ className }: { className?: string }) {
  return (
    <motion.div
      className={className}
      animate={{ opacity: [1, 0.5, 1] }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: easeOut,
      }}
    />
  );
}

function SpotifyWidgetSkeleton() {
  return (
    <div className="h-[100px] w-full rounded-lg bg-white/40 p-1">
      <div className="relative mb-1 flex h-[72px] items-center gap-4 rounded-md bg-gradient-to-br from-orange-50 via-orange-100 to-yellow-50 p-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]">
        <PulseBlock className="h-16 w-16 flex-shrink-0 rounded-md bg-white" />
        <div className="flex flex-1 flex-col gap-2">
          <PulseBlock className="h-5 w-3/4 rounded bg-white" />
          <PulseBlock className="h-5 w-1/2 rounded bg-white" />
        </div>
      </div>
      <div className="flex items-center gap-2 pl-1">
        <PulseBlock className="size-2 rounded-full bg-white" />
        <PulseBlock className="h-[1em] w-1/3 rounded bg-white" />
      </div>
    </div>
  );
}

export default function SpotifyWidget() {
  const { data, isLoading } = useSWR<SpotifyApiResponse>(
    "/api/spotify",
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  if (isLoading) return <SpotifyWidgetSkeleton />;
  if (!data) return null;

  return <SpotifyContent {...data} />;
}
