export function adageImageUrl(slug: string) {
  return `/api/adages-images/web/${slug}.webp`;
}

export function isAllowedAdageImageKey(key: string) {
  return /^web\/[a-z0-9-]+\.webp$/.test(key);
}
