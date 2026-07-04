export type LinkPreviewData = {
  url: string;
  title: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon: string;
  embeddable: boolean;
};

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
]);

const PRIVATE_IPV4_PATTERN =
  /^(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|127\.\d{1,3}\.\d{1,3}\.\d{1,3}|169\.254\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})$/;

export function validatePreviewUrl(urlString: string): URL {
  let url: URL;

  try {
    url = new URL(urlString);
  } catch {
    throw new Error("Invalid URL");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Unsupported protocol");
  }

  const hostname = url.hostname.toLowerCase();

  if (
    BLOCKED_HOSTNAMES.has(hostname) ||
    hostname.endsWith(".localhost") ||
    PRIVATE_IPV4_PATTERN.test(hostname)
  ) {
    throw new Error("URL not allowed");
  }

  return url;
}

function extractMetaContent(
  html: string,
  attribute: "property" | "name",
  value: string
): string | undefined {
  const pattern = new RegExp(
    `<meta[^>]*${attribute}=["']${value}["'][^>]*content=["']([^"']*)["'][^>]*>|<meta[^>]*content=["']([^"']*)["'][^>]*${attribute}=["']${value}["'][^>]*>`,
    "i"
  );
  const match = html.match(pattern);
  return match?.[1] || match?.[2] || undefined;
}

function extractTitle(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match?.[1]?.trim() || undefined;
}

function resolveUrl(base: URL, value?: string): string | undefined {
  if (!value) return undefined;

  try {
    return new URL(value, base).href;
  } catch {
    return undefined;
  }
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

const NON_IFRAME_HOSTS = new Set([
  "open.spotify.com",
  "spotify.com",
  "linkedin.com",
  "www.linkedin.com",
]);

function canEmbedHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  return !NON_IFRAME_HOSTS.has(normalized) && !normalized.endsWith(".linkedin.com");
}

export function isEmbeddable(headers: Headers, hostname: string): boolean {
  if (!canEmbedHost(hostname)) {
    return false;
  }
  const xfo = headers.get("x-frame-options")?.toLowerCase().trim();
  if (xfo === "deny" || xfo === "sameorigin") {
    return false;
  }

  const cspHeaders = [
    headers.get("content-security-policy"),
    headers.get("content-security-policy-report-only"),
  ].filter((value): value is string => Boolean(value));

  for (const csp of cspHeaders) {
    const match = csp.match(/frame-ancestors\s+([^;]+)/i);
    if (!match) continue;

    const directive = match[1].trim().toLowerCase();
    if (directive === "'none'" || directive === "none") {
      return false;
    }
    if (directive === "'self'" || directive === "self") {
      return false;
    }
    if (!directive.includes("*")) {
      return false;
    }
  }

  return true;
}

export function buildFallbackPreview(urlString: string): LinkPreviewData {
  const url = validatePreviewUrl(urlString);
  const hostname = url.hostname.replace(/^www\./, "");

  return {
    url: url.href,
    title: hostname,
    siteName: hostname,
    favicon: `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`,
    embeddable: false,
  };
}

export function parseLinkPreview(html: string, url: URL, headers: Headers): LinkPreviewData {
  const title =
    extractMetaContent(html, "property", "og:title") ||
    extractMetaContent(html, "name", "twitter:title") ||
    extractTitle(html) ||
    url.hostname;

  const description =
    extractMetaContent(html, "property", "og:description") ||
    extractMetaContent(html, "name", "description") ||
    extractMetaContent(html, "name", "twitter:description");

  const image = resolveUrl(
    url,
    extractMetaContent(html, "property", "og:image") ||
      extractMetaContent(html, "name", "twitter:image")
  );

  const siteName =
    extractMetaContent(html, "property", "og:site_name") || url.hostname;

  return {
    url: url.href,
    title: decodeHtmlEntities(title),
    description: description ? decodeHtmlEntities(description) : undefined,
    image,
    siteName: siteName ? decodeHtmlEntities(siteName) : undefined,
    favicon: `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`,
    embeddable: isEmbeddable(headers, url.hostname),
  };
}

export async function fetchLinkPreview(urlString: string): Promise<LinkPreviewData> {
  const { fetchGenericPreview, fetchHostAwarePreview } = await import(
    "@/lib/link-preview-providers"
  );
  const url = validatePreviewUrl(urlString);
  const hostPreview = await fetchHostAwarePreview(url);

  if (hostPreview) {
    return hostPreview;
  }

  return fetchGenericPreview(url);
}
