"use client";

import { useState } from "react";
import { Popover } from "@base-ui/react/popover";
import useSWR from "swr";
import type { LinkPreviewData } from "@/lib/link-preview";
import {
  IFRAME_HEIGHT,
  IFRAME_WIDTH,
  PREVIEW_HEIGHT,
  PREVIEW_SCALE,
  SPOTIFY_EMBED_HEIGHT,
  previewFetcher,
} from "./shared";
import { SpotifyEmbedPreview } from "./SpotifyEmbedPreview";
import {
  getPreviewEmbedConfig,
  getSpotifyEmbedConfig,
  shouldShowIframePreview,
} from "./embed-url";
import {
  getPreviewLayout,
  previewShellWidthClass,
  type PreviewLayout,
} from "./layouts";

function PreviewShell({
  layout,
  children,
}: {
  layout: PreviewLayout;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col ${previewShellWidthClass[layout]}`}>
      {children}
    </div>
  );
}

function PreviewHeader({
  favicon,
  title,
}: {
  favicon: string;
  title: string;
}) {
  return (
    <div className="flex h-7 shrink-0 items-center gap-1 border-b border-orange-200/50 px-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={favicon}
        alt=""
        width={12}
        height={12}
        className="size-3 shrink-0 rounded-sm"
        loading="lazy"
        decoding="async"
      />
      <Popover.Title className="truncate text-[10px] font-medium tracking-tight text-neutral-600">
        {title}
      </Popover.Title>
    </div>
  );
}

function PreviewFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-7 shrink-0 items-center border-t border-orange-200/50 px-2">
      <Popover.Description className="truncate text-[9px] tracking-tight text-neutral-400">
        {children}
      </Popover.Description>
    </div>
  );
}

function PreviewLoadingBody({
  hostname,
  height,
}: {
  hostname?: string;
  height: number;
}) {
  return (
    <div
      className="relative shrink-0 overflow-hidden bg-gradient-to-br from-orange-100/55 to-orange-50/25"
      style={{ height }}
    >
      <div
        className="preview-shimmer pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/45 to-transparent"
        aria-hidden
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
        <div
          className="size-3 animate-spin rounded-full border-2 border-orange-300/35 border-t-orange-500/80 motion-reduce:animate-none"
          aria-hidden
        />
        <span className="text-[9px] font-medium tracking-tight text-neutral-500">
          Loading preview…
        </span>
        {hostname && (
          <span className="max-w-[85%] truncate text-[9px] tracking-tight text-neutral-400">
            {hostname}
          </span>
        )}
      </div>
    </div>
  );
}

function PreviewSkeleton({ href }: { href: string }) {
  const layout = getPreviewLayout(href);
  const hostname = new URL(href).hostname.replace(/^www\./, "");
  const bodyHeight =
    layout === "spotify" ? SPOTIFY_EMBED_HEIGHT : PREVIEW_HEIGHT;

  return (
    <PreviewShell layout={layout}>
      <div className="flex h-7 shrink-0 items-center gap-1 border-b border-orange-200/50 px-2">
        <div className="flex shrink-0 gap-1" aria-hidden>
          <span className="size-1.5 rounded-full bg-orange-400/50" />
          <span className="size-1.5 rounded-full bg-orange-300/45" />
          <span className="size-1.5 rounded-full bg-orange-200/55" />
        </div>
        <div className="min-w-0 flex-1 overflow-hidden rounded border border-orange-200/40 bg-white/50 px-1.5 py-0.5">
          <span className="block truncate text-[9px] tracking-tight text-neutral-500/90">
            {hostname}
          </span>
        </div>
      </div>
      <PreviewLoadingBody hostname={hostname} height={bodyHeight} />
      <div className="flex h-7 shrink-0 items-center px-2">
        <div className="h-1.5 w-10 animate-pulse rounded bg-orange-200/35 motion-reduce:animate-none" />
      </div>
    </PreviewShell>
  );
}

function IframePreview({ href, preview }: { href: string; preview: LinkPreviewData }) {
  const [loaded, setLoaded] = useState(false);
  const hostname = new URL(href).hostname.replace(/^www\./, "");
  const embedConfig = getPreviewEmbedConfig(href);
  const iframeSrc = embedConfig?.src ?? href;
  const layout = getPreviewLayout(href);
  const bodyHeight = embedConfig?.height ?? PREVIEW_HEIGHT;

  return (
    <PreviewShell layout={layout}>
      <PreviewHeader favicon={preview.favicon} title={preview.title} />
      <div
        className="relative shrink-0 overflow-hidden bg-[#121212]"
        style={{ height: bodyHeight }}
      >
        {!loaded && (
          <PreviewLoadingBody hostname={hostname} height={bodyHeight} />
        )}
        {embedConfig?.native ? (
          <iframe
            src={iframeSrc}
            title={`Preview of ${preview.title}`}
            width={embedConfig.width}
            height={embedConfig.height}
            className={`block border-0 transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0"}`}
            allow={embedConfig.allow}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            tabIndex={-1}
          />
        ) : (
          <iframe
            src={iframeSrc}
            title={`Preview of ${preview.title}`}
            className={`pointer-events-none absolute left-0 top-0 border-0 transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0"}`}
            style={{
              width: IFRAME_WIDTH,
              height: IFRAME_HEIGHT,
              transform: `scale(${PREVIEW_SCALE})`,
              transformOrigin: "top left",
            }}
            onLoad={() => setLoaded(true)}
            tabIndex={-1}
          />
        )}
      </div>
      <PreviewFooter>{hostname}</PreviewFooter>
    </PreviewShell>
  );
}

function MetadataPreview({ preview }: { preview: LinkPreviewData }) {
  const hostname = new URL(preview.url).hostname.replace(/^www\./, "");

  return (
    <PreviewShell layout="default">
      <PreviewHeader favicon={preview.favicon} title={preview.title} />
      <div
        className="relative shrink-0 overflow-hidden bg-neutral-100"
        style={{ height: PREVIEW_HEIGHT }}
      >
        {preview.image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={preview.image}
            alt=""
            className="size-full object-cover"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-1.5 bg-orange-100/30 px-4 text-center">
            <span className="line-clamp-2 font-instrument text-sm leading-[1.2] tracking-[0.01em] text-neutral-900">
              {preview.title}
            </span>
            {preview.description && (
              <span className="line-clamp-3 text-[10px] leading-[1.35] tracking-tight text-neutral-600/90">
                {preview.description}
              </span>
            )}
          </div>
        )}
      </div>
      <PreviewFooter>{hostname}</PreviewFooter>
    </PreviewShell>
  );
}

export function LinkPreviewPanel({ href }: { href: string }) {
  const spotifyEmbed = getSpotifyEmbedConfig(href);

  const { data, isLoading } = useSWR<LinkPreviewData>(
    spotifyEmbed ? null : href,
    previewFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
    }
  );

  if (spotifyEmbed) {
    return <SpotifyEmbedPreview href={href} />;
  }

  if (isLoading || !data) {
    return <PreviewSkeleton href={href} />;
  }

  if (shouldShowIframePreview(href, data.embeddable)) {
    return <IframePreview href={href} preview={data} />;
  }

  return <MetadataPreview preview={data} />;
}
