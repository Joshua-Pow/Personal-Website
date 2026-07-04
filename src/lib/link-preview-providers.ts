import {
  buildFallbackPreview,
  parseLinkPreview,
  type LinkPreviewData,
} from "@/lib/link-preview";

export const PREVIEW_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const FETCH_TIMEOUT_MS = 8_000;

export function isLinkedInHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/^www\./, "");
  return normalized === "linkedin.com" || normalized.endsWith(".linkedin.com");
}

export function isXHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/^www\./, "");
  return normalized === "x.com" || normalized === "twitter.com";
}

function formatVanity(vanity: string): string {
  return vanity
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isUselessPreviewTitle(title: string): boolean {
  const normalized = title.toLowerCase();
  return (
    normalized.includes("sign in") ||
    normalized.includes("join linkedin") ||
    normalized.includes("security verification") ||
    normalized === "linkedin"
  );
}

async function fetchPreviewHtml(url: URL): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url.href, {
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": PREVIEW_USER_AGENT,
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.text()).slice(0, 100_000);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function buildLinkedInPreview(url: URL): LinkPreviewData {
  const vanity = url.pathname.match(/\/in\/([^/]+)/i)?.[1];
  const title = vanity ? formatVanity(vanity) : "LinkedIn Profile";

  return {
    url: url.href,
    title,
    description: "View profile on LinkedIn",
    siteName: "LinkedIn",
    favicon: "https://www.google.com/s2/favicons?domain=linkedin.com&sz=32",
    embeddable: false,
  };
}

async function tryParseFetchedPreview(url: URL): Promise<LinkPreviewData | null> {
  const html = await fetchPreviewHtml(url);
  if (!html) return null;

  const preview = parseLinkPreview(html, url, new Headers());
  if (isUselessPreviewTitle(preview.title)) {
    return null;
  }

  return preview;
}

export async function fetchHostAwarePreview(url: URL): Promise<LinkPreviewData | null> {
  if (isXHost(url.hostname)) {
    return tryParseFetchedPreview(url);
  }

  if (isLinkedInHost(url.hostname)) {
    const preview = await tryParseFetchedPreview(url);
    return preview ?? buildLinkedInPreview(url);
  }

  return null;
}

export async function fetchGenericPreview(url: URL): Promise<LinkPreviewData> {
  const html = await fetchPreviewHtml(url);

  if (!html) {
    return buildFallbackPreview(url.href);
  }

  return parseLinkPreview(html, url, new Headers());
}
