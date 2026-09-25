import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site-metadata";

interface PageHeadInput {
  title?: string;
  path: string;
}

export function absoluteUrl(path: string) {
  if (path === "/") {
    return SITE_URL;
  }

  return `${SITE_URL}${path}`;
}

export function buildPageHead({ title, path }: PageHeadInput) {
  const url = absoluteUrl(path);
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: SITE_DESCRIPTION },
      { property: "og:url", content: url },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: SITE_DESCRIPTION },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: SITE_DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
