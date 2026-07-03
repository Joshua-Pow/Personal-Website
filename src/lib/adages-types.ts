export function formatAdageDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(isoDate));
}

export type AdageData = {
  slug: string;
  quote: string;
  attribution: string;
  heardFrom: string;
  addedAt: string;
  imageUrl: string;
};
