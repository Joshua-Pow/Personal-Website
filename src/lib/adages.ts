import { createElement, type ReactNode } from "react";
import { adageImageUrl } from "@/lib/adages-images";
import { adages as adageEntries } from "@/lib/adages-manifest";
import type { AdageData } from "@/lib/adages-types";

export type { AdageData };

export type Adage = AdageData & {
  content: ReactNode;
};

function renderBody(body: string): ReactNode {
  const paragraphs = body.split(/\n\n+/).map((part) => part.trim()).filter(Boolean);

  if (paragraphs.length === 0) {
    return null;
  }

  if (paragraphs.length === 1) {
    return createElement("p", null, paragraphs[0]);
  }

  return paragraphs.map((paragraph, index) =>
    createElement("p", { key: index }, paragraph),
  );
}

export async function getAdages(): Promise<Adage[]> {
  return adageEntries
    .map((entry) => ({
      slug: entry.slug,
      quote: entry.quote,
      attribution: entry.attribution,
      heardFrom: entry.heardFrom,
      addedAt: entry.addedAt,
      imageUrl: adageImageUrl(entry.slug),
      content: renderBody(entry.body),
    }))
    .toSorted(
      (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
    );
}
