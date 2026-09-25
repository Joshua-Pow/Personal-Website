import { createFileRoute } from "@tanstack/react-router";

import { isAllowedAdageImageKey } from "@/lib/adages-images";
import { getWorkerEnv } from "@/lib/cf";
import { SITE_URL } from "@/lib/site-metadata";

const CACHE_CONTROL = "public, max-age=31536000, immutable";

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function imageResponse(bytes: Uint8Array) {
  return new Response(toArrayBuffer(bytes), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": CACHE_CONTROL,
    },
  });
}

async function readFromR2(objectKey: string): Promise<Response | null> {
  try {
    const object = await getWorkerEnv().ADAGES_IMAGES.get(objectKey);
    if (!object) {
      return null;
    }

    const headers = new Headers();
    headers.set(
      "Content-Type",
      object.httpMetadata?.contentType ?? "image/webp"
    );
    headers.set("Cache-Control", CACHE_CONTROL);
    return new Response(object.body, { headers });
  } catch {
    return null;
  }
}

async function readLocalImage(objectKey: string): Promise<Uint8Array | null> {
  try {
    const fs = await import("node:fs/promises");
    const { default: path } = await import("node:path");
    const filePath = path.join(process.cwd(), "adages-images", objectKey);
    return await fs.readFile(filePath);
  } catch {
    return null;
  }
}

async function cacheLocalImage(objectKey: string, bytes: Uint8Array) {
  try {
    const fs = await import("node:fs/promises");
    const { default: path } = await import("node:path");
    const filePath = path.join(process.cwd(), "adages-images", objectKey);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, bytes);
  } catch {
    // Cache write is best-effort for local DX; serve the bytes either way.
  }
}

async function fetchProductionImage(
  objectKey: string
): Promise<Uint8Array | null> {
  try {
    const upstream = await fetch(`${SITE_URL}/api/adages-images/${objectKey}`);
    if (!upstream.ok) {
      return null;
    }
    return new Uint8Array(await upstream.arrayBuffer());
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/api/adages-images/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const objectKey = params._splat ?? "";

        if (!isAllowedAdageImageKey(objectKey)) {
          return new Response("Not found", { status: 404 });
        }

        const fromR2 = await readFromR2(objectKey);
        if (fromR2) {
          return fromR2;
        }

        if (import.meta.env.DEV) {
          const local = await readLocalImage(objectKey);
          if (local) {
            return imageResponse(local);
          }

          const fromProd = await fetchProductionImage(objectKey);
          if (fromProd) {
            void cacheLocalImage(objectKey, fromProd);
            return imageResponse(fromProd);
          }
        }

        return new Response("Not found", { status: 404 });
      },
    },
  },
});
