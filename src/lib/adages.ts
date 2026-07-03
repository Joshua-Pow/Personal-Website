import fs from "fs";
import path from "path";
import type { ReactNode } from "react";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import { adageImageUrl } from "@/lib/adages-images";
import type { AdageData } from "@/lib/adages-types";

export type { AdageData };

export type Adage = AdageData & {
  content: ReactNode;
};

type AdageFrontmatter = {
  slug: string;
  quote: string;
  attribution: string;
  heardFrom: string;
  addedAt: string;
};

const ADAGES_DIR = path.join(process.cwd(), "src/content/adages");

function toTrimmedString(value: unknown, field: string, fileName: string) {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "string") {
    return value.trim();
  }

  throw new Error(
    `Frontmatter field "${field}" must be a string in ${fileName}`,
  );
}

function parseFrontmatter(data: Record<string, unknown>, fileName: string) {
  const required = [
    "slug",
    "quote",
    "attribution",
    "heardFrom",
    "addedAt",
  ] as const;

  const parsed = {} as AdageFrontmatter;

  for (const field of required) {
    const value = toTrimmedString(data[field], field, fileName);
    if (!value) {
      throw new Error(
        `Missing required frontmatter field "${field}" in ${fileName}`,
      );
    }
    parsed[field] = value;
  }

  if (!/^[a-z0-9-]+$/.test(parsed.slug)) {
    throw new Error(
      `Invalid slug "${parsed.slug}" in ${fileName}. Use lowercase letters, numbers, and hyphens.`,
    );
  }

  return parsed;
}

async function loadAdageFile(fileName: string): Promise<Adage> {
  const filePath = path.join(ADAGES_DIR, fileName);
  const source = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(source);
  const frontmatter = parseFrontmatter(data as Record<string, unknown>, fileName);

  const { content: mdxContent } = await compileMDX({
    source: content.trim(),
    options: { parseFrontmatter: false },
  });

  return {
    slug: frontmatter.slug,
    quote: frontmatter.quote,
    attribution: frontmatter.attribution,
    heardFrom: frontmatter.heardFrom,
    addedAt: frontmatter.addedAt,
    imageUrl: adageImageUrl(frontmatter.slug),
    content: mdxContent,
  };
}

export async function getAdages(): Promise<Adage[]> {
  if (!fs.existsSync(ADAGES_DIR)) {
    return [];
  }

  const files = fs
    .readdirSync(ADAGES_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .sort();

  const adages = await Promise.all(files.map(loadAdageFile));

  return adages.sort(
    (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
  );
}
