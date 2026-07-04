"use client";

import type { ReactNode } from "react";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { formatAdageDate, type AdageData } from "@/lib/adages-types";

type AdageCardProps = {
  adage: AdageData & { content: ReactNode };
  index: number;
};

export function AdageCard({ adage, index }: AdageCardProps) {
  const baseDelay = index * 30;
  const isShortQuote = adage.quote.length < 80;

  return (
    <RevealOnScroll variant="blurUp" delay={baseDelay} className="flex flex-col gap-6">
      <div className="relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden rounded-2xl px-10 py-14">
        {/* Plain img avoids Cloudflare IMAGES binding transform fees */}
        <img
          src={adage.imageUrl}
          alt=""
          aria-hidden
          width={800}
          height={420}
          className="absolute inset-0 size-full object-cover"
          loading={index === 0 ? "eager" : "lazy"}
          fetchPriority={index === 0 ? "high" : "auto"}
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/45 to-black/55" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_15%,rgba(251,146,60,0.22),transparent_55%)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.22'/%3E%3C/svg%3E\")",
          }}
        />

        <blockquote
          className={`relative z-10 max-w-[480px] text-center font-instrument leading-[1.4] tracking-[0.015em] text-[#F5F0E8] ${
            isShortQuote ? "text-[2.25rem]" : "text-[1.875rem]"
          }`}
        >
          &ldquo;{adage.quote.replace(/^"|"$/g, "")}&rdquo;
        </blockquote>
        <p className="relative z-10 mt-6 text-center font-instrument text-lg italic leading-7 tracking-[0.01em] text-[#F5F0E8]/75">
          &mdash; {adage.attribution}
        </p>
      </div>

      <div className="flex flex-col gap-3 px-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtle">
            Heard from
          </span>
          <span className="text-sm font-medium tracking-tight text-on-surface">
            {adage.heardFrom}
          </span>
        </div>
        <time
          dateTime={adage.addedAt}
          className="text-xs tracking-wide text-subtle"
        >
          {formatAdageDate(adage.addedAt)}
        </time>
        <RevealOnScroll
          variant="fadeUpSm"
          delay={baseDelay + 80}
          as="div"
          className="text-sm leading-[1.57] tracking-tight text-on-surface-muted"
        >
          {adage.content}
        </RevealOnScroll>
      </div>
    </RevealOnScroll>
  );
}
