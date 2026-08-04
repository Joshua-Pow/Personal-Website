import { promises as fs } from "node:fs";
import path from "node:path";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAllowedAdageImageKey } from "@/lib/adages-images";
import { SITE_URL } from "@/lib/site-metadata";

const CACHE_CONTROL = "public, max-age=31536000, immutable";

function localImagePath(objectKey: string) {
  return path.join(process.cwd(), "adages-images", objectKey);
}

async function readLocalImage(objectKey: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(localImagePath(objectKey));
  } catch {
    return null;
  }
}

async function cacheLocalImage(objectKey: string, bytes: Buffer) {
  const filePath = localImagePath(objectKey);
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, bytes);
  } catch {
    // Cache write is best-effort for local DX; serve the bytes either way.
  }
}

async function readFromR2(objectKey: string): Promise<Response | null> {
  try {
    const { env } = getCloudflareContext();
    const object = await env.ADAGES_IMAGES.get(objectKey);
    if (!object) return null;

    const headers = new Headers();
    headers.set(
      "Content-Type",
      object.httpMetadata?.contentType ?? "image/webp",
    );
    headers.set("Cache-Control", CACHE_CONTROL);
    return new Response(object.body, { headers });
  } catch {
    return null;
  }
}

async function fetchProductionImage(objectKey: string): Promise<Buffer | null> {
  try {
    const upstream = await fetch(
      `${SITE_URL}/api/adages-images/${objectKey}`,
      { next: { revalidate: 0 } },
    );
    if (!upstream.ok) return null;
    return Buffer.from(await upstream.arrayBuffer());
  } catch {
    return null;
  }
}

function imageResponse(bytes: Buffer) {
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": CACHE_CONTROL,
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const objectKey = key.join("/");

  if (!isAllowedAdageImageKey(objectKey)) {
    return new Response("Not found", { status: 404 });
  }

  const fromR2 = await readFromR2(objectKey);
  if (fromR2) return fromR2;

  // Local DX: disk cache, then production proxy (R2 remote bindings can miss
  // objects that exist in prod, and plain `next dev` may lack bindings entirely).
  if (process.env.NODE_ENV === "development") {
    const local = await readLocalImage(objectKey);
    if (local) return imageResponse(local);

    const fromProd = await fetchProductionImage(objectKey);
    if (fromProd) {
      void cacheLocalImage(objectKey, fromProd);
      return imageResponse(fromProd);
    }
  }

  return new Response("Not found", { status: 404 });
}
